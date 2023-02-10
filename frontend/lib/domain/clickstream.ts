export type Clickstream = {
  event: string;
  timestamp: Date;
  user: string;
  url: string | null;
  source: string | null;
};

export type ClickstreamResponse = {
  count: number;
  data: Clickstream[];
};
