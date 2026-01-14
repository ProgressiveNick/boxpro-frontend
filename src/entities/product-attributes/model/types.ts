export type AttributeValue = {
  id: number;
  name: string;
  value: Attribute;
  number_value?: number;
  string_value?: string;
  harakteristica: Attribute;
  [key: string]: unknown;
};

export type Attribute = {
  id: number;
  type: "number" | "string" | "boolean" | "range";
  unit?: string;
  name: string;
  [key: string]: unknown;
};
