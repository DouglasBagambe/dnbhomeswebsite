import Image from "next/image";
import Link from "next/link";

export function BrandMark({ className = "" }: { className?: string }) {
  return <span className={`brand-mark ${className}`} aria-hidden="true">
    <Image src="/brand/dnb-mark-light.svg" width={499} height={499} alt="" />
  </span>;
}

export function Brand({ footer = false }: { footer?: boolean }) {
  return <Link className={`brand ${footer ? "footer-brand" : ""}`} href="/" aria-label="Homes home">
    <BrandMark /><span className="brand-wordmark">HOMES</span>
  </Link>;
}
