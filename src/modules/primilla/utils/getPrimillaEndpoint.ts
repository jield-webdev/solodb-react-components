export default function getPrimillaUrl(): string {
  const endpoint = document.getElementById("root")?.dataset.primillaEndpoint ?? "";
  return `https://${endpoint}/`;
}
