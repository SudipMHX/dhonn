import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "dhonn. | Little sounds, big reactions",
    short_name: "dhonn.",
    description: "Discover, play, and share quick creator-made sounds.",
    start_url: "/",
    display: "standalone",
    background_color: "#020617",
    theme_color: "#020617",
    icons: [
      {
        src: "/app-icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/app-icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/app-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
