import { HomeSoundboardClient } from "@/components/home-soundboard-client"
import { getHomeInitialData } from "@/lib/services/sounds"

export default async function HomePage() {
  const initialData = await getHomeInitialData()
  return <HomeSoundboardClient initialData={initialData} />
}
