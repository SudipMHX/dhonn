const CACHE_NAME = "dhonn-offline-v1"
const OFFLINE_URL = "/offline.html"
const AUDIO_PATH = /^\/api\/sounds\/[^/]+\/audio$/

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.add(OFFLINE_URL)),
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
            .filter((key) => key.startsWith("dhonn-") && key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener("fetch", (event) => {
  const request = event.request
  const url = new URL(request.url)
  if (url.origin !== self.location.origin || request.method !== "GET") return

  if (AUDIO_PATH.test(url.pathname) && !url.searchParams.has("download")) {
    event.respondWith(handleAudioRequest(request))
    return
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(CACHE_NAME)
        return (await cache.match(OFFLINE_URL)) || Response.error()
      }),
    )
  }
})

async function handleAudioRequest(request) {
  const cacheKey = new Request(request.url, { method: "GET" })
  let cache
  try {
    cache = await caches.open(CACHE_NAME)
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

function rangeNotSatisfiable(size = 0) {
  return new Response(null, {
    status: 416,
    headers: { "Content-Range": `bytes */${size}` },
  })
}
