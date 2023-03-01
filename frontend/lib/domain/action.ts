import { AppertureUser as User } from './user';

export type Action = {
  _id: string;
  datasourceId: string;
  appId: string;
  name: string;
  groups: ActionGroup[];
  eventType: CaptureEvent;
  updateAt: Date;
};

export type ActionGroup = {
  text: string;
  href: string;
  selector: string;
  url: string;
  url_matching: string;
  event: CaptureEvent;
};

export type ActionWithUser = Action & {
  user: User;
};

export type ActionEventData = {
  count: number;
  data: {
    event: string;
    uid: string;
    url: string;
    source: string;
    timestamp: Date;
  }[];
};

export enum CaptureEvent {
  AUTOCAPTURE = '$autocapture',
  PAGEVIEW = '$pageview',
}

export enum ConditionType {
  href = 'Link target (href tag)',
  css = 'CSS Selector / HTML attribute',
  text = 'Text',
  url = 'Page URL',
}
