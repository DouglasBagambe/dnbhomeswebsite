import Image from "next/image";
import Link from "next/link";

export function Brand({ footer = false }: { footer?: boolean }) {
  return <Link className={`brand ${footer ? "footer-brand" : ""}`} href="/" aria-label="Homes home">
    <Image src="/brand/dnb-mark-light.svg" width={38} height={38} alt="" priority={!footer} />
    <span>Homes</span>
  </Link>;
}
