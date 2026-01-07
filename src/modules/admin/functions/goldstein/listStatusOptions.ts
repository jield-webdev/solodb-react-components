export interface StatusOption {
  id: number;
  status: string;
  front_color: string;
  back_color: string;
}

export async function listStatusOptions(serverEndpoint: string): Promise<StatusOption[]> {
  const url = `https://${serverEndpoint}/api/onelab/list/equipment/status`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch status options: ${response.statusText}`);
  }

  const data = await response.json();
  return data._embedded.items;
}
