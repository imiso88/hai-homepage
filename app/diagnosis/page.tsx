"use client";

import Link from "next/link";

export default function Diagnosis() {
  return (
    <div style={{ width: "100%", height: "100vh", position: "relative", overflow: "hidden" }}>
      <Link
        href="/"
        style={{
          position: "absolute",
          top: "15px",
          left: "15px",
          backgroundColor: "#1b2340",
          color: "#ffffff",
          padding: "10px 18px",
          borderRadius: "20px",
          textDecoration: "none",
          fontSize: "13px",
          fontWeight: "bold",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          zIndex: 9999,
          display: "inline-flex",
          alignItems: "center",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        ???덊럹?댁?濡??뚯븘媛湲?      </Link>
      <iframe
        src="https://claude.ai/code/artifact/04820d5d-2393-4d3d-9fd4-6ffae896cf79"
        style={{ width: "100%", height: "100vh", border: "none" }}
        title="AX 以鍮꾨룄 吏꾨떒"
      />
    </div>
  );
}
