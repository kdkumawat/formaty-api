export interface PlaygroundPayload {
  input: string;
  output: string;
  format: string;
  options?: Record<string, unknown>;
}

export function validatePlaygroundPayload(
  body: unknown,
  maxSize: number
): { ok: true; data: PlaygroundPayload } | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Invalid JSON" };
  }

  const obj = body as Record<string, unknown>;
  const size = JSON.stringify(obj).length;
  if (size > maxSize) {
    return { ok: false, error: "Payload too large" };
  }

  if (typeof obj.input !== "string") {
    return { ok: false, error: "Missing or invalid 'input'" };
  }
  if (typeof obj.output !== "string") {
    return { ok: false, error: "Missing or invalid 'output'" };
  }
  if (typeof obj.format !== "string") {
    return { ok: false, error: "Missing or invalid 'format'" };
  }

  const options = obj.options;
  if (options !== undefined && (typeof options !== "object" || options === null)) {
    return { ok: false, error: "Invalid 'options'" };
  }

  return {
    ok: true,
    data: {
      input: obj.input,
      output: obj.output,
      format: obj.format,
      options: (options as Record<string, unknown>) ?? {},
    },
  };
}
