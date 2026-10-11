import type { CSSProperties } from "react";
import "./startup-brand-loader.css";

/** Approved opening only. Not mounted: SSR content needs no blocking bootstrap. */
export function StartupBrandLoader() {
  return <div className="signature-startup" role="status" aria-label="Entering Homes">
<svg viewBox="170 250 684 700" role="img" aria-label="Homes">
  <g className="signature-group">
    <path className="signature-ink signature-mark signature-dash" pathLength="1" d="M320,318 C380,350 445,430 445,540 C445,640 410,700 355,700 C295,700 280,620 282,540 C285,470 315,425 345,395 C380,360 400,350 440,345 C520,335 610,360 655,430 C700,500 705,600 670,660 C645,705 600,710 580,680 C555,645 565,560 610,490 C640,445 670,420 745,398"/>
    <g className="signature-gaps">
      <path className="signature-halo" strokeWidth="76" d="M320,318 C380,350 445,430 445,540"/>
      <path className="signature-halo" strokeWidth="76" d="M440,345 C520,335 610,360 655,430 C700,500 705,600 670,660"/>
      <path className="signature-ink" strokeWidth="48" d="M320,318 C380,350 445,430 445,540"/>
      <path className="signature-ink" strokeWidth="48" d="M440,345 C520,335 610,360 655,430 C700,500 705,600 670,660"/>
    </g>

    <g transform="translate(354 812) scale(.6)">
      <path className="signature-ink signature-w signature-dash" pathLength="1" style={{ "--d": "1550ms", "--t": "170ms" } as CSSProperties} d="M0,0 L0,100"/>
      <path className="signature-ink signature-w signature-dash" pathLength="1" style={{ "--d": "1735ms", "--t": "100ms" } as CSSProperties} d="M0,50 L62,50"/>
      <path className="signature-ink signature-w signature-dash" pathLength="1" style={{ "--d": "1850ms", "--t": "170ms" } as CSSProperties} d="M62,0 L62,100"/>
      <path className="signature-ink signature-w signature-dash" pathLength="1" style={{ "--d": "2090ms", "--t": "300ms" } as CSSProperties} d="M138,0 A44,50 0 1 0 138,100 A44,50 0 1 0 138,0"/>
      <path className="signature-ink signature-w signature-dash" pathLength="1" style={{ "--d": "2460ms", "--t": "380ms" } as CSSProperties} d="M226,100 L226,0 L276,64 L326,0 L326,100"/>
      <path className="signature-ink signature-w signature-dash" pathLength="1" style={{ "--d": "2910ms", "--t": "250ms" } as CSSProperties} d="M436,0 L378,0 L378,100 L436,100"/>
      <path className="signature-ink signature-w signature-dash" pathLength="1" style={{ "--d": "3175ms", "--t": "90ms" } as CSSProperties} d="M378,50 L426,50"/>
      <path className="signature-ink signature-w signature-dash" pathLength="1" style={{ "--d": "3335ms", "--t": "300ms" } as CSSProperties} d="M524,18 C516,6 500,0 490,0 C474,0 464,10 464,24 C464,40 478,46 494,50 C510,54 526,60 526,76 C526,92 514,100 498,100 C484,100 470,94 462,82"/>
    </g>
  </g>
</svg>
</div>;
}
