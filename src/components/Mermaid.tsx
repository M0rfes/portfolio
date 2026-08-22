"use client";

import { MermaidDiagram } from "react-super-mermaid";

const MERMAID_CDN =
  "https://cdn.jsdelivr.net/npm/mermaid@11.17.0/dist/mermaid.esm.min.mjs";

export function Mermaid({ chart }: { chart: string }) {
  return (
    <div className="mermaid-diagram">
      <MermaidDiagram
        code={chart}
        theme="dark"
        dark
        panZoom={false}
        search={false}
        exportable={false}
        background={false}
        fullscreen={false}
        mermaid={{ cdnUrl: MERMAID_CDN }}
        mermaidConfig={{
          startOnLoad: false,
          securityLevel: "loose",
          flowchart: { htmlLabels: true, useMaxWidth: true },
          sequence: { useMaxWidth: true },
        }}
      />
    </div>
  );
}
