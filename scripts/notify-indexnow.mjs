import fs from 'node:fs/promises';
import assert from 'node:assert/strict';

// The ownership key is deliberately public, as required by the IndexNow protocol.
// Dry run by default. Submit only URLs changed in the current authorized work.
const config=JSON.parse(await fs.readFile(new URL('./indexnow-config.json',import.meta.url),'utf8'));
assert.equal(config.host,'www.humanai-edu.kr');
assert.match(config.key,/^[a-f0-9]{32}$/);
assert.equal(config.keyLocation,`https://${config.host}/${config.key}.txt`);
assert.equal(await fs.readFile(new URL('../public/'+config.key+'.txt',import.meta.url),'utf8'),config.key);
const args=process.argv.slice(2),submit=args.includes('--submit');
const urls=args.filter(arg=>arg!=='--submit');
if(!urls.length)throw Error('Pass changed HTTPS page URLs; --submit sends after live checks.');
assert.ok(urls.length<=10000);
for(const raw of urls){
 const url=new URL(raw);
 assert.equal(url.origin,'https://'+config.host);
 assert.equal(url.search,'');assert.equal(url.hash,'');assert.equal(url.username,'');assert.equal(url.password,'');
 assert.ok(url.pathname==='/'||/^\/[a-z0-9-]+\.html$/.test(url.pathname),'Only public canonical HTML pages');
 assert.ok(!['/resource-verify.html','/landing.html','/contact.html','/privacy.html'].includes(url.pathname));
}
if(!submit){console.log(JSON.stringify({mode:'dry-run',host:config.host,urlCount:urls.length,urlList:urls}));process.exit(0);}
const keyResponse=await fetch(config.keyLocation,{redirect:'manual',signal:AbortSignal.timeout(15000)});
assert.equal(keyResponse.status,200,'Ownership key must be live before submission');
assert.equal(await keyResponse.text(),config.key);
for(const url of urls){
 const r=await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(15000)});assert.equal(r.status,200,url);
 const html=await r.text();
 assert.ok(!/noindex/i.test(r.headers.get('x-robots-tag')||''));
 assert.ok(!/<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html));
 assert.ok(html.includes('href="'+url+'"'),'Self canonical required: '+url);
}
const response=await fetch('https://searchadvisor.naver.com/indexnow',{
 method:'POST',headers:{'Content-Type':'application/json; charset=utf-8'},
 body:JSON.stringify({...config,urlList:[...new Set(urls)]}),signal:AbortSignal.timeout(20000),
});
console.log(JSON.stringify({endpoint:'NAVER IndexNow',status:response.status,urlCount:new Set(urls).size,meaning:response.status===200?'Received successfully; indexing not guaranteed':response.status===202?'Received; ownership verification pending':'Submission not confirmed'}));
if(![200,202].includes(response.status))process.exitCode=1;
