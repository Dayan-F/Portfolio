import type { ToolSpec } from '@/demos/agents/types'

/**
 * Open-Meteo needs no API key and allows browser origins, so a visitor can watch
 * the agent fetch genuinely current numbers rather than a canned fixture.
 */

const GEOCODING_ENDPOINT = 'https://geocoding-api.open-meteo.com/v1/search'
const FORECAST_ENDPOINT = 'https://api.open-meteo.com/v1/forecast'

type GeocodingResponse = {
  results?: {
    name: string
    latitude: number
    longitude: number
    country?: string
    admin1?: string
  }[]
}

type ForecastResponse = {
  current?: Record<string, number | string>
  current_units?: Record<string, string>
  daily?: Record<string, (number | string)[]>
  daily_units?: Record<string, string>
}

/** Open-Meteo reports weather as WMO codes; the numbers alone tell the model nothing. */
const WEATHER_CODES: Record<number, string> = {
  0: 'clear sky',
  1: 'mainly clear',
  2: 'partly cloudy',
  3: 'overcast',
  45: 'fog',
  48: 'depositing rime fog',
  51: 'light drizzle',
  53: 'moderate drizzle',
  55: 'dense drizzle',
  61: 'slight rain',
  63: 'moderate rain',
  65: 'heavy rain',
  71: 'slight snow',
  73: 'moderate snow',
  75: 'heavy snow',
  80: 'slight rain showers',
  81: 'moderate rain showers',
  82: 'violent rain showers',
  95: 'thunderstorm',
  96: 'thunderstorm with slight hail',
  99: 'thunderstorm with heavy hail',
}

function describeCode(code: unknown): string {
  const value = Number(code)
  return WEATHER_CODES[value] ?? 'unknown conditions'
}

export const getWeather: ToolSpec = {
  name: 'get_weather',
  description:
    'Get the current weather and a short daily forecast for a place, by name. Returns real ' +
    'live readings: temperature, apparent temperature, wind speed, precipitation and a ' +
    'description of conditions, plus daily highs and lows.',
  input_schema: {
    type: 'object',
    properties: {
      location: {
        type: 'string',
        description: 'A place name, for example "Avignon" or "Lisbon, Portugal".',
      },
      days: {
        type: 'integer',
        description: 'How many days of forecast to include, 1 to 7. Defaults to 3.',
      },
    },
    required: ['location'],
  },
  async run(input, signal) {
    const location = String(input.location ?? '')
    const days = Math.min(Math.max(Number(input.days ?? 3) || 3, 1), 7)

    const geocodingUrl = new URL(GEOCODING_ENDPOINT)
    geocodingUrl.search = new URLSearchParams({
      name: location,
      count: '1',
      format: 'json',
    }).toString()

    const geocodingResponse = await fetch(geocodingUrl, { signal })
    if (!geocodingResponse.ok) throw new Error(`Geocoding failed with ${geocodingResponse.status}`)

    const geocoding = (await geocodingResponse.json()) as GeocodingResponse
    const place = geocoding.results?.[0]
    if (!place) return { location, found: false, hint: 'No place matched that name.' }

    const forecastUrl = new URL(FORECAST_ENDPOINT)
    forecastUrl.search = new URLSearchParams({
      latitude: String(place.latitude),
      longitude: String(place.longitude),
      current: 'temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum',
      forecast_days: String(days),
      timezone: 'auto',
    }).toString()

    const forecastResponse = await fetch(forecastUrl, { signal })
    if (!forecastResponse.ok) throw new Error(`Forecast failed with ${forecastResponse.status}`)

    const forecast = (await forecastResponse.json()) as ForecastResponse
    const current = forecast.current ?? {}
    const daily = forecast.daily ?? {}
    const times = (daily.time ?? []) as string[]

    return {
      found: true,
      place: [place.name, place.admin1, place.country].filter(Boolean).join(', '),
      current: {
        time: current.time ?? null,
        conditions: describeCode(current.weather_code),
        temperature_c: current.temperature_2m ?? null,
        feels_like_c: current.apparent_temperature ?? null,
        precipitation_mm: current.precipitation ?? null,
        wind_speed_kmh: current.wind_speed_10m ?? null,
      },
      daily: times.map((date, index) => ({
        date,
        conditions: describeCode(daily.weather_code?.[index]),
        high_c: daily.temperature_2m_max?.[index] ?? null,
        low_c: daily.temperature_2m_min?.[index] ?? null,
        precipitation_mm: daily.precipitation_sum?.[index] ?? null,
      })),
    }
  },
}
