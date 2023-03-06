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
  href = 'href',
  selector = 'selector',
  text = 'text',
  url = 'url',
}
