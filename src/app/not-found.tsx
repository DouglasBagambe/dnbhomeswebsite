import Link from "next/link";
export default function NotFound() { return <div className="container section"><div className="card state"><div><h1>Page not found</h1><p className="muted">The page may have moved or the property is no longer published.</p><Link className="button" href="/discover">Browse properties</Link></div></div></div>; }
