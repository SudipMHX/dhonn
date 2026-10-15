export function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status })
}

export function validationError() {
  return jsonError("The request contains invalid data.", 400)
}

export class InvalidJsonError extends Error {}
export class RequestBodyTooLargeError extends Error {}

export async function readJson(
  request: Request,
  maxBytes = 64 * 1024
): Promise<unknown> {
  if (
    !request.headers
      .get("content-type")
      ?.toLowerCase()
      .startsWith("application/json")
  ) {
    throw new InvalidJsonError()
  }
  const contentLength = Number(request.headers.get("content-length"))
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    throw new RequestBodyTooLargeError()
  }
  if (!request.body) throw new InvalidJsonError()

  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > maxBytes) {
      await reader.cancel()
      throw new RequestBodyTooLargeError()
    }
    chunks.push(value)
  }

  const content = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) {
    content.set(chunk, offset)
    offset += chunk.byteLength
  }

  try {
    return JSON.parse(new TextDecoder().decode(content)) as unknown
  } catch {
    throw new InvalidJsonError()
  }
}
