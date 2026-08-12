import Link from "next/link";
import { CircleAlert, House } from "lucide-react";

export function EmptyState({ title = "No properties found", message = "Try changing your location, budget or filters." }: { title?: string; message?: string }) {
  return <div className="state"><div><House size={28} /><h2>{title}</h2><p className="muted">{message}</p><Link className="button" href="/discover">Explore properties</Link></div></div>;
}

export function ErrorState({ message = "We could not load properties right now." }: { message?: string }) {
  return <div className="state error"><div><CircleAlert size={28} /><h2>Something went wrong</h2><p>{message}</p><Link className="button secondary" href="">Try again</Link></div></div>;
}

export function PropertySkeleton() { return <div className="card property-card" aria-hidden="true"><div className="property-image image-placeholder" /><div className="property-body"><div style={{ height: 18, width: "45%", background: "#e5eae6" }} /><div style={{ height: 18, marginTop: 15, background: "#edf0ed" }} /></div></div>; }
