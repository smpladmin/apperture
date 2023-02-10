import { AppertureUser as User } from './user';

export type Action = {
  _id: string;
  datasourceId: string;
  appId: string;
  name: string;
  groups: ActionGroup[];
  updateAt: Date;
};

export type ActionGroup = {
  text: string;
  href: string;
  selector: string;
  url: string;
};

export type ActionWithUser = Action & {
  user: User;
};

export enum CaptureEvent {
  AUTOCAPTURE = 'autocapture',
  PAGEVIEW = 'pageview',
}
