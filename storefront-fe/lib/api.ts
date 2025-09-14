import { type Booking, type CreateBookingPayload, type Hotel, type HotelSearchParams } from "./types"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") || "/api"

type Query = Record<string, unknown | undefined>

function toQueryString(query?: Query) {
  if (!query) return ""
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null) continue
    if (Array.isArray(v)) v.forEach((vv) => params.append(k, String(vv)))
    else params.append(k, String(v))
  }
  const s = params.toString()
  return s ? `?${s}` : ""
}

function toURL(path: string, query?: Query) {
  const p = path.startsWith("http") ? path : `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`
  return `${p}${toQueryString(query)}`
}

export class ApiError extends Error {
  status: number
  data?: unknown
  constructor(message: string, status: number, data?: unknown) {
    super(message)
    this.status = status
    this.data = data
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit & { query?: Query }): Promise<T> {
  const { query, headers, ...rest } = init || {}
  const url = toURL(path, query)

  const res = await fetch(url, {
    credentials: "include",
    headers: {
      "Accept": "application/json",
      ...(rest.method && rest.method !== "GET" ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    ...rest,
    // Search/listing endpoints shouldn't be cached during iteration
    cache: rest.cache ?? (rest.method === "GET" ? "no-store" : undefined),
  })

  const contentType = res.headers.get("content-type") || ""
  const isJson = contentType.includes("application/json")

  if (!res.ok) {
    let detail: any = undefined
    try {
      detail = isJson ? await res.json() : await res.text()
    } catch {
      // ignore
    }
    const message = (detail && (detail.message || detail.error || JSON.stringify(detail))) || res.statusText
    throw new ApiError(message, res.status, detail)
  }

  if (res.status === 204) return undefined as unknown as T
  return (isJson ? await res.json() : (await res.text())) as T
}

// Hotels
export async function searchHotels(params: HotelSearchParams): Promise<Hotel[]> {
  // Conventional route: /api/hotels/search
  return apiFetch<Hotel[]>(`/hotels/search`, { method: "GET", query: params as Query })
}

export async function getHotel(id: string): Promise<Hotel> {
  // Conventional route: /api/hotels/{id}
  return apiFetch<Hotel>(`/hotels/${encodeURIComponent(id)}`)
}

// Bookings
export async function createBooking(payload: CreateBookingPayload): Promise<Booking> {
  // Conventional route: /api/bookings
  return apiFetch<Booking>(`/bookings`, { method: "POST", body: JSON.stringify(payload) })
}
