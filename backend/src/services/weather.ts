import axios from 'axios'
import { config } from '../config/env.js'

export interface WeatherCondition {
  temperature: number
  precipitation: number
  windSpeed: number
  visibility: number
  condition: 'clear' | 'cloudy' | 'rain' | 'snow' | 'fog' | 'storm'
  travelTimeMultiplier: number
}

export interface Location {
  lat: number
  lng: number
}

class WeatherService {
  private cache = new Map<string, { data: WeatherCondition; expiry: number }>()
  private readonly CACHE_TTL_MS = 30 * 60 * 1000

  private getCacheKey(location: Location): string {
    return `${location.lat.toFixed(2)},${location.lng.toFixed(2)}`
  }

  async getWeatherCondition(location: Location): Promise<WeatherCondition> {
    const cacheKey = this.getCacheKey(location)
    const cached = this.cache.get(cacheKey)

    if (cached && cached.expiry > Date.now()) {
      return cached.data
    }

    if (!config.WEATHER_API_KEY) {
      return this.getDefaultCondition()
    }

    try {
      const response = await axios.get(
        `https://atlas.microsoft.com/weather/currentConditions/json`,
        {
          params: {
            'api-version': '1.1',
            query: `${location.lat},${location.lng}`,
            'subscription-key': config.WEATHER_API_KEY,
          },
          timeout: 5000,
        }
      )

      const result = response.data?.results?.[0]

      if (result) {
        const condition = this.mapCondition(result)

        this.cache.set(cacheKey, {
          data: condition,
          expiry: Date.now() + this.CACHE_TTL_MS,
        })

        return condition
      }

      return this.getDefaultCondition()
    } catch (error) {
      console.error('Weather API error:', error)
      return this.getDefaultCondition()
    }
  }

  async getWeatherAlongRoute(
    waypoints: Location[]
  ): Promise<{ waypoint: Location; weather: WeatherCondition }[]> {
    const results = await Promise.all(
      waypoints.map(async (waypoint) => ({
        waypoint,
        weather: await this.getWeatherCondition(waypoint),
      }))
    )
    return results
  }

  private mapCondition(apiResult: Record<string, unknown>): WeatherCondition {
    const phrase = (apiResult.phrase as string)?.toLowerCase() || ''
    const temp = (apiResult.temperature as { value: number })?.value ?? 15
    const precip = (apiResult.precipitationSummary as { pastHour: { value: number } })?.pastHour
      ?.value ?? 0
    const wind = (apiResult.wind as { speed: { value: number } })?.speed?.value ?? 0
    const visibility = (apiResult.visibility as { value: number })?.value ?? 10

    let condition: WeatherCondition['condition'] = 'clear'
    let multiplier = 1.0

    if (phrase.includes('storm') || phrase.includes('thunder')) {
      condition = 'storm'
      multiplier = 1.5
    } else if (phrase.includes('snow') || phrase.includes('sleet')) {
      condition = 'snow'
      multiplier = 1.4
    } else if (phrase.includes('rain') || phrase.includes('shower')) {
      condition = 'rain'
      multiplier = 1.2
    } else if (phrase.includes('fog') || phrase.includes('mist')) {
      condition = 'fog'
      multiplier = 1.3
    } else if (phrase.includes('cloud') || phrase.includes('overcast')) {
      condition = 'cloudy'
      multiplier = 1.0
    }

    if (visibility < 1) multiplier += 0.2
    if (wind > 50) multiplier += 0.1
    if (temp < 0) multiplier += 0.1

    return {
      temperature: temp,
      precipitation: precip,
      windSpeed: wind,
      visibility,
      condition,
      travelTimeMultiplier: Math.min(multiplier, 2.0),
    }
  }

  private getDefaultCondition(): WeatherCondition {
    return {
      temperature: 15,
      precipitation: 0,
      windSpeed: 10,
      visibility: 10,
      condition: 'clear',
      travelTimeMultiplier: 1.0,
    }
  }

  clearCache() {
    this.cache.clear()
  }
}

export const weatherService = new WeatherService()
