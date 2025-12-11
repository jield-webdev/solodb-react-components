export interface Site {
  id: number;
  name: string;
  code: string;
  has_floor_plans: boolean;
  has_external_chemical_labelling: boolean;
  amount: {
    buildings: number;
  };
}
