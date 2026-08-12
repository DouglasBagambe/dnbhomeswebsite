"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <div className="container section"><div className="card state error"><div><h1>We could not load this page</h1><p>Please check your connection and try again.</p><button className="button" onClick={reset}>Try again</button></div></div></div>; }
