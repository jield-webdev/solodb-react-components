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
  const body: { error?: string } | null = await response.json().catch(() => null);
  return body?.error ?? `Primilla request failed (${response.status})`;
};

export const getPrimillaPathUrl = (path: string): string => new URL(path, getPrimillaUrl()).href;

export async function primillaFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const token = getAuthToken();
  if (!token) {
    throw new PrimillaError("You are not authenticated to talk to Primilla", 401);
  }

  const response = await fetch(input, {
    ...init,
    headers: { ...init.headers, Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new PrimillaError(await getErrorMessage(response), response.status);
  }

  return response;
}
