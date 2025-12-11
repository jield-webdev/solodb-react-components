export interface FilterFormData {
  filter: Filter;
  facet: Facet;
}

export interface Filter {
  name: string;
  label: string | null;
  elements: FieldsetElement[];
  fieldsets: Record<string, Fieldset>;
}

export interface Facet {
  name: string;
  label: string | null;
  visibility: string;
  elements: FieldsetElement[];
  fieldsets: Record<string, Fieldset>;
}

export interface Fieldset {
  name: string;
  label: string | null;
  visibility: string;
  elements: FieldsetElement[];
  fieldsets: Record<string, Fieldset>;
}

export interface FieldsetElement {
  name: string;
  type: string;
  label: string;
  options: Options;
  value_options: Record<string, string>;
}

export interface Options {
  label?: string;
  value_options?: Record<string, string>;
  inline?: boolean;
  type?: number;
}

export interface FilterData {
  filter: { general: string[] };
  facet: { [fieldsetName: string]: {values: string[]} };
}
