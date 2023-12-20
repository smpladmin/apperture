import { DatamartAction } from './datamartActions';
import { AppertureUser } from './user';
import { SpreadSheetColumn } from './workbook';

export type DataMartTableData = {
  data: any[];
  headers: SpreadSheetColumn[];
};

export type DataMartObj = {
  _id: string;
  datasourceId: string;
  appId: string;
  name: string;
  query: string;
  lastRefreshed: Date;
};

export type DataMartWithUser = DataMartObj & {
  user: AppertureUser;
  actions?: DatamartAction[];
};

export type DataMartMetaData = {
  name: string;
  query: string;
};
