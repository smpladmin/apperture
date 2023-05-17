export type Clickstream = {
  event: string;
  timestamp: Date;
  uid: string;
  url: string | null;
  source: string | null;
};

export type ClickstreamResponse = {
  count: number;
  data: Clickstream[];
};

export type ComputedStreamElementProperty = {
  text: string;
  href: string;
  tag_name: string;
};

export type ComputedStreamEvent = {
  name: string;
  type: string;
  elements: ComputedStreamElementProperty;
};
