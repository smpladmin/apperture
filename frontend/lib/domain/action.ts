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

export enum UrlMatching {
  CONTAINS = 'contains',
  REGEX = 'regex',
  EXACT = 'exact',
}

export type ActionGroup = {
  text: string | null;
  href: string | null;
  selector: string | null;
  url: string | null;
  url_matching: UrlMatching;
  event: CaptureEvent;
};

export type ActionWithUser = Action & {
  user: User;
};

export type ActionEventData = {
  event: CaptureEvent;
  uid: string;
  url: string;
  source: string;
  timestamp: Date;
};

export type ActionMetaData = {
  count: number;
  data: ActionEventData[];
};

export enum CaptureEvent {
  AUTOCAPTURE = '$autocapture',
  PAGEVIEW = '$pageview',
  PAGELEAVE = '$pageleave',
  RAGECLICK = '$rageclick',
  IDENTIFY = '$identify',
}

export enum ConditionType {
  href = 'href',
  selector = 'selector',
  text = 'text',
  url = 'url',
}
