import { Provider } from './provider';

export type Edge = {
  _id: string;
  datasourceId: string;
  provider: Provider;
  previousEvent: string;
  currentEvent: string;
  users: number;
  hits: number;
};
