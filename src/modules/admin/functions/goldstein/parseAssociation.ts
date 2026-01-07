export function parseAssociation(assoc: string): [string, number] {
  const [type, idStr] = assoc.split(":");

  if (!type || !idStr) {
    throw new Error(`Invalid association format: "${assoc}"`);
  }

  const id = parseInt(idStr, 10);
  if (isNaN(id)) {
    throw new Error(`Invalid ID part in association: "${idStr}"`);
  }

  return [type, id];
}
