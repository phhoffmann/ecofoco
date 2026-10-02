import { Geolocation } from '@capacitor/geolocation'

export interface Coordinates {
  lat: number
  lng: number
}

/**
 * One coarse (city-level) fix. Android only declares ACCESS_COARSE_LOCATION, and the plugin asks
 * for it here if needed. Callers turn this into a Biome id and drop it — coordinates are never stored.
 */
export async function getApproximatePosition(): Promise<Coordinates> {
  const { coords } = await Geolocation.getCurrentPosition({
    enableHighAccuracy: false,
    timeout: 20_000,
    maximumAge: 60 * 60 * 1000,
  })
  return { lat: coords.latitude, lng: coords.longitude }
}
