export interface Parameter {
  id: number;
  name: string;
  abbr: string;
  type: ParameterType;
}

export interface ParameterType {
  id: number;
  name: string;
  abbr: string;
}
