export function logError(event: string, error: unknown) {
  console.error(
    JSON.stringify({
      level: "error",
      event,
      error: error instanceof Error ? error.name : "UnknownError",
      timestamp: new Date().toISOString(),
    })
  )
}
