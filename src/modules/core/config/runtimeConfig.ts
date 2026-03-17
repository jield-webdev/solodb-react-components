type RuntimeConfig = {
  serverUri: string;
  irisServerUri: string;
};

const cfg: RuntimeConfig = {
  serverUri: "",
  irisServerUri: "",
};

function normalizeBaseUri(input: string): string {
  if (!input) return "";

  // Add protocol if missing
  const withProtocol = /^[a-zA-Z]+:\/\//.test(input)
    ? input
    : `https://${input}`;

  const url = new URL(withProtocol);

  // Strip any path/query/hash
  url.pathname = "/";
  url.search = "";
  url.hash = "";

  return url.toString(); // always ends with "/"
}

export function initSolodbComponents(partial: Partial<RuntimeConfig>) {
  if (partial.serverUri !== undefined) {
    cfg.serverUri = normalizeBaseUri(partial.serverUri);
  }

  if (partial.irisServerUri !== undefined) {
    cfg.irisServerUri = normalizeBaseUri(partial.irisServerUri);
  }
}

export function getSolodbServerApiUrl() {
  return cfg.serverUri + "api";
}

export function getIrisServerUrl() {
  return cfg.irisServerUri;
}
