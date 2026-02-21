import axios from 'axios'
import { config } from '../config/env.js'

export interface TravelTimeResult {
  distanceMeters: number
  durationMinutes: number
  durationInTrafficMinutes?: number
}

export interface Location {
  lat: number
  lng: number
}

class TrafficService {
  private cache = new Map<string, { data: TravelTimeResult; expiry: number }>()
  private readonly CACHE_TTL_MS = 15 * 60 * 1000

  private getCacheKey(origin: Location, destination: Location): string {
    return `${origin.lat.toFixed(4)},${origin.lng.toFixed(4)}-${destination.lat.toFixed(4)},${destination.lng.toFixed(4)}`
  }

  async getTravelTime(origin: Location, destination: Location): Promise<TravelTimeResult> {
    const cacheKey = this.getCacheKey(origin, destination)
    const cached = this.cache.get(cacheKey)

    if (cached && cached.expiry > Date.now()) {
      return cached.data
    }

    if (!config.GOOGLE_MAPS_API_KEY) {
      return this.estimateWithHaversine(origin, destination)
    }

    try {
      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/distancematrix/json',
        {
          params: {
            origins: `${origin.lat},${origin.lng}`,
            destinations: `${destination.lat},${destination.lng}`,
            departure_time: 'now',
            traffic_model: 'best_guess',
            key: config.GOOGLE_MAPS_API_KEY,
          },
          timeout: 5000,
        }
      )

      const element = response.data?.rows?.[0]?.elements?.[0]

      if (element?.status === 'OK') {
        const result: TravelTimeResult = {
          distanceMeters: element.distance.value,
          durationMinutes: Math.ceil(element.duration.value / 60),
          durationInTrafficMinutes: element.duration_in_traffic
            ? Math.ceil(element.duration_in_traffic.value / 60)
            : undefined,
        }

        this.cache.set(cacheKey, {
          data: result,
          expiry: Date.now() + this.CACHE_TTL_MS,
        })

        return result
      }

      return this.estimateWithHaversine(origin, destination)
    } catch (error) {
      console.error('Traffic API error:', error)
      return this.estimateWithHaversine(origin, destination)
    }
  }

  async getDistanceMatrix(
    origins: Location[],
    destinations: Location[]
  ): Promise<TravelTimeResult[][]> {
    const matrix: TravelTimeResult[][] = []

    for (const origin of origins) {
      const row: TravelTimeResult[] = []
      for (const destination of destinations) {
        const result = await this.getTravelTime(origin, destination)
        row.push(result)
      }
      matrix.push(row)
    }

    return matrix
  }

  private estimateWithHaversine(origin: Location, destination: Location): TravelTimeResult {
    const R = 6371000
    const lat1 = (origin.lat * Math.PI) / 180
    const lat2 = (destination.lat * Math.PI) / 180
    const deltaLat = ((destination.lat - origin.lat) * Math.PI) / 180
    const deltaLng = ((destination.lng - origin.lng) * Math.PI) / 180

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    const distanceMeters = R * c
    const avgSpeedKmh = 30
    const durationMinutes = Math.ceil((distanceMeters / 1000 / avgSpeedKmh) * 60)

    return {
      distanceMeters: Math.round(distanceMeters),
      durationMinutes,
    }
  }

  clearCache() {
    this.cache.clear()
  }
}

export const trafficService = new TrafficService()
