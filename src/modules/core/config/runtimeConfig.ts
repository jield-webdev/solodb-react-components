type RuntimeConfig = {
  serverUri: string;
};

const cfg: RuntimeConfig = {
  serverUri: "",
};

export function initSolodbComponents(partial: Partial<RuntimeConfig>) {
  if (partial.serverUri !== undefined) cfg.serverUri = partial.serverUri;
}

export function getServerUri() {
  return cfg.serverUri + "/api";
}
