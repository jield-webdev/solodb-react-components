import getPrimillaUrl from "./getPrimillaEndpoint";

export class PrimillaError extends Error {
  constructor(
    message: string,
    readonly status?: number
  ) {
    super(message);
    this.name = "PrimillaError";
  }
}

const getAuthToken = (): string => document.getElementById("root")?.dataset.jwt ?? "";

const getErrorMessage = async (response: Response): Promise<string> => {
  const body: unknown = await response.json().catch(() => null);
  return body && typeof body === "object" && "error" in body && typeof body.error === "string"
    ? body.error
    : `Primilla request failed (${response.status})`;
};

export const getStreamErrorStatus = (message: string): number | undefined => {
  switch (message) {
    case "conversation not found":
      return 404;
    case "conversation was changed by another request":
      return 409;
    case "conversation is too long, start a new conversation":
      return 422;
    case "internal server error":
      return 500;
    case "the model did not finish its answer":
      return 502;
    case "request timed out":
      return 504;
    default:
      return undefined;
  }
};

export const getPrimillaPathUrl = (path: string): string => new URL(path, getPrimillaUrl()).href;

export async function primillaFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const token = getAuthToken();
  if (!token) {
    throw new PrimillaError("You are not authenticated to talk to Primilla", 401);
  }

  const response = await fetch(input, {
    ...init,
    credentials: "omit",
    headers: { ...init.headers, Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new PrimillaError(await getErrorMessage(response), response.status);
  }

  return response;
}
