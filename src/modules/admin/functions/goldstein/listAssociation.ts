export async function listAssociationItems(
  serverEndpoint: string,
): Promise<string[]> {
  if (serverEndpoint == "") {
    return [];
  }

  const url = `https://${serverEndpoint}/api/list/association_items`;
  const response = await fetch(url);
  const resp = await response.json();
  const data = resp.association_items;

  return data;
}

type AvailableEquipment = {
    id: number;
    mes_name: string;
}; 

export async function listAvailableEquipment(
  serverEndpoint: string,
): Promise<AvailableEquipment[]> {
  if (serverEndpoint == "") {
    return [];
  }

  const url = `https://${serverEndpoint}/api/onelab/list/available-equipment`;
  const response = await fetch(url);
  const resp = await response.json();
  const data = resp._embedded.items;

  return data;
}
