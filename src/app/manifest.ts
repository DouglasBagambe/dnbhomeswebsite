import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return { name: "Homes", short_name: "Homes", description: "Property discovery in Uganda", start_url: "/", display: "standalone", background_color: "#f7f8f6", theme_color: "#0b8a57" };
}
