const AUDIO_CACHE = "dhonn-offline-v1"
const APP_CACHE = "dhonn-app-v1"
const AUDIO_PATH = /^\/api\/sounds\/[^/]+\/audio$/
const PUBLIC_API_PATHS = new Set(["/api/categories", "/api/sounds"])
const MAX_APP_CACHE_ENTRIES = 100

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const response = await fetch("/", { credentials: "omit" })
        if (response.ok && response.status === 200) {
          const cache = await caches.open(APP_CACHE)
          await cache.put(new URL("/", self.location.origin).href, response)
        }
      } catch (error) {
        console.error("Could not save the home page for offline use.", error)
      }
    })(),
  )
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) =>
                key.startsWith("dhonn-") &&
                key !== AUDIO_CACHE &&
                key !== APP_CACHE,
            )
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener("message", (event) => {
  if (event.data?.type === "CLEAR_APP_CACHE") {
    event.waitUntil(caches.delete(APP_CACHE))
  } else if (event.data?.type === "CACHE_PUBLIC_PAGES") {
    const urls = Array.isArray(event.data.urls)
      ? event.data.urls.filter(isPublicPageUrl).slice(0, 16)
      : []
    event.waitUntil(Promise.allSettled(urls.map(cachePublicPage)))
  }
})

self.addEventListener("fetch", (event) => {
  const request = event.request
  const url = new URL(request.url)
  if (url.origin !== self.location.origin || request.method !== "GET") return

  if (AUDIO_PATH.test(url.pathname) && !url.searchParams.has("download")) {
    event.respondWith(handleAudioRequest(request))
    return
  }

  if (!isPrivateRequest(url.pathname) && isAppRequest(request, url)) {
    event.respondWith(networkFirst(request))
  }
})

async function handleAudioRequest(request) {
  const cacheKey = new Request(request.url, { method: "GET" })
  let cache
  try {
    cache = await caches.open(AUDIO_CACHE)
  } catch (error) {
    console.error("Audio cache is unavailable; continuing with network playback.", error)
    return fetch(request)
  }

  let response
  try {
    response = await cache.match(cacheKey)
  } catch (error) {
    console.error("Could not read the audio cache; trying the network.", error)
  }

  if (!response) {
    const networkRequest = new Request(request.url, {
      method: "GET",
      credentials: "same-origin",
      headers: {
        Accept: request.headers.get("Accept") || "*/*",
      },
    })

    try {
      response = await fetch(networkRequest)
    } catch {
      return new Response("This sound has not been saved for offline playback.", {
        status: 503,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      })
    }

    if (!response.ok || response.status !== 200) return response
    try {
      await cache.put(cacheKey, response.clone())
    } catch (error) {
      console.error("Could not save this sound for offline playback.", error)
    }
  }

  return rangeResponse(response, request.headers.get("Range"))
}

async function rangeResponse(response, rangeHeader) {
  if (!rangeHeader || response.status !== 200) return response

  const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader)
  if (!match) return rangeNotSatisfiable()

  const body = await response.arrayBuffer()
  const size = body.byteLength
  const start = match[1] ? Number(match[1]) : null
  const end = match[2] ? Number(match[2]) : null
  const rangeStart = start === null ? Math.max(0, size - end) : start
  const rangeEnd = end === null ? size - 1 : Math.min(end, size - 1)

  if (
    !size ||
    rangeStart < 0 ||
    rangeStart >= size ||
    rangeEnd < rangeStart
  ) {
    return rangeNotSatisfiable(size)
  }

  const headers = new Headers(response.headers)
  headers.set("Accept-Ranges", "bytes")
  headers.set("Content-Range", `bytes ${rangeStart}-${rangeEnd}/${size}`)
  headers.set("Content-Length", String(rangeEnd - rangeStart + 1))

  return new Response(body.slice(rangeStart, rangeEnd + 1), {
    status: 206,
    headers,
  })
}

function isPrivateRequest(pathname) {
  return [
    "/admin",
    "/dashboard",
    "/api/admin",
    "/api/auth",
    "/api/dashboard",
    "/api/favorites",
    "/api/profile",
    "/api/reports",
    "/api/uploads",
  ].some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

function isAppRequest(request, url) {
  if (request.mode === "navigate") return true
  if (PUBLIC_API_PATHS.has(url.pathname)) return true
  if (request.headers.has("RSC") || request.headers.has("Next-Router-Prefetch")) {
    return true
  }
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname === "/manifest.webmanifest" ||
    ["font", "image", "script", "style"].includes(request.destination)
  )
}

async function cachePublicPage(value) {
  const url = getPublicPageUrl(value)
  if (!url) return

  const request = new Request(url.href, {
    credentials: "omit",
    headers: { Accept: "text/html" },
  })
  try {
    const response = await fetch(request)
    if (
      !response.ok ||
      response.status !== 200 ||
      !response.headers.get("content-type")?.includes("text/html") ||
      response.headers.has("set-cookie")
    ) {
      return
    }
    const cache = await caches.open(APP_CACHE)
    await cache.put(request, response)
    await trimCache(cache)
  } catch (error) {
    console.error("Could not save this page for offline use.", error)
  }
}

function isPublicPageUrl(value) {
  return getPublicPageUrl(value) !== null
}

function getPublicPageUrl(value) {
  let url
  try {
    url = new URL(value, self.location.origin)
  } catch {
    return null
  }
  if (
    url.origin !== self.location.origin ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/_next/") ||
    url.pathname.includes(".") ||
    isPrivateRequest(url.pathname)
  ) {
    return null
  }
  url.hash = ""
  return url
}

async function networkFirst(request) {
  let cache
  try {
    cache = await caches.open(APP_CACHE)
  } catch (error) {
    console.error("App cache is unavailable; continuing with network.", error)
    return fetch(request)
  }

  try {
    const response = await fetch(request)
    if (response.ok && response.status === 200 && !response.headers.has("set-cookie")) {
      try {
        await cache.put(request, response.clone())
        await trimCache(cache)
      } catch (error) {
        console.error("Could not save this page for offline use.", error)
      }
    }
    if (response.status >= 500) {
      const cached = await cachedFallback(cache, request)
      if (cached) return cached
    }
    return response
  } catch {
    return (await cachedFallback(cache, request)) || Response.error()
  }
}

async function cachedFallback(cache, request) {
  try {
    const cached = await cache.match(request)
    if (cached) return cached

    if (request.mode === "navigate") {
      return await cache.match(new URL("/", self.location.origin).href)
    }
  } catch (error) {
    console.error("Could not load cached app content.", error)
  }

  return undefined
}

async function trimCache(cache) {
  const requests = await cache.keys()
  if (requests.length <= MAX_APP_CACHE_ENTRIES) return
  const removable = requests.filter(
    (request) => new URL(request.url).pathname !== "/",
  )
  await Promise.all(
    removable
      .slice(0, Math.max(0, requests.length - MAX_APP_CACHE_ENTRIES))
      .map((request) => cache.delete(request)),
  )
}

function rangeNotSatisfiable(size = 0) {
  return new Response(null, {
    status: 416,
    headers: { "Content-Range": `bytes */${size}` },
  })
}
