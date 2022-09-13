export enum FilterTypes {
  DEVICE_TYPE = 'deviceType',
  OS = 'os',
  CITY = 'city',
  COUNTRY = 'country',
  UTM_SOURCE = 'utmSource',
  UTM_MEDIUM = 'utmSource',
  UTM_CAMPAIGN = 'utmCampaign',
}

export type FilterOption = {
  label: string;
  id: FilterTypes;
};

export class Filters {
  os: Array<string>;
  deviceType: Array<string>;
  city: Array<string>;
  country: Array<string>;
  utmSource: Array<string>;
  utmMedium: Array<string>;
  utmCampaign: Array<string>;
  constructor() {
    this.os = [];
    this.deviceType = [];
    this.city = [];
    this.country = [];
    this.utmSource = [];
    this.utmMedium = [];
    this.utmCampaign = [];
  }
}
