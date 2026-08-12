import Image from "next/image";
import Link from "next/link";

export function Brand({ footer = false }: { footer?: boolean }) {
  return <Link className={`brand ${footer ? "footer-brand" : ""}`} href="/" aria-label="Homes home">
    <span className="brand-mark" aria-hidden="true">
      <Image className="brand-mark-light" src="/brand/dnb-mark-light.svg" width={38} height={38} alt="" />
      <Image className="brand-mark-dark" src="/brand/dnb-mark-dark.svg" width={38} height={38} alt="" />
    </span>
    <span>Homes</span>
  </Link>;
}
