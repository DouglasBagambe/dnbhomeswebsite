import { PropertySkeleton } from "@/components/states";

export default function Loading() { return <div className="container section"><div className="property-grid">{Array.from({ length: 6 }, (_, index) => <PropertySkeleton key={index} />)}</div></div>; }
