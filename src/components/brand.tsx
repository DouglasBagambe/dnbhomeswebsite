import Link from "next/link";

export function Brand({ footer = false }: { footer?: boolean }) {
  return <Link className={`brand ${footer ? "footer-brand" : ""}`} href="/" aria-label="Homes home">
    <span className="brand-symbol" aria-hidden="true">H.</span><span className="brand-wordmark">HOMES</span>
  </Link>;
}
