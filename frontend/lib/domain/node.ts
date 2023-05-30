export type Property = { name: string; type: string };

export type Node = {
  id: string;
  name: string;
  source: string;
  properties: Property[];
};
