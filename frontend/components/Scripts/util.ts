import {
  APIMeta,
  ActionFrequency,
  ActionMeta,
  GoogleSheetMeta,
  Schedule,
  ActionType,
  TableMeta,
} from '@lib/domain/datamartActions';

export const isValidMeta = (
  meta: ActionMeta | {}
): meta is APIMeta | GoogleSheetMeta => {
  return Boolean(
    ((meta as APIMeta)?.url && (meta as APIMeta)?.headers) ||
      (meta as TableMeta)?.name ||
      ((meta as GoogleSheetMeta)?.spreadsheet &&
        (meta as GoogleSheetMeta)?.sheet)
  );
};

export const TypeNameMap = {
  [ActionType.GOOGLE_SHEET]: 'Google Sheet',
  [ActionType.API]: 'API',
  [ActionType.TABLE]: 'Table',
};

export const isValidSchedule = (schedule: Schedule): boolean => {
  const { frequency, time, period, day, date, datamartId } = schedule || {};

  switch (frequency) {
    case ActionFrequency.HOURLY:
      return true;
    case ActionFrequency.QUARTER_HOURLY:
      return true;
    case ActionFrequency.HALF_HOURLY:
      return true;
    case ActionFrequency.DAILY:
      return !!(time && period);
    case ActionFrequency.WEEKLY:
      return !!(time && period && day);
    case ActionFrequency.MONTHLY:
      return !!(time && period && date);
    case ActionFrequency.DATAMART:
      return !!(datamartId);
    default:
      return false;
  }
};

export const getTableName = (name: string) => {
  let fileName = name.trim();

  const punctuationRegex = /[!"#$%&'()*+,-./:;<=>?@[\]^`{|}~]/g;
  const tableNameWithoutPunctuation = fileName.replace(punctuationRegex, '');
  const tableName = tableNameWithoutPunctuation.split(/\s+/).join('_');

  return tableName;
};

export const describeSchedule = (schedule: Schedule) => {
  const { frequency, time, period, day, date } = schedule || {};

  switch (frequency) {
    case ActionFrequency.HOURLY:
      return 'Every Hour';
    case ActionFrequency.QUARTER_HOURLY:
      return 'Every 15 minutes';
    case ActionFrequency.HALF_HOURLY:
      return 'Every 30 minutes';
    case ActionFrequency.DAILY:
      return `Daily on ${time} ${period}`;
    case ActionFrequency.WEEKLY:
      return `Weekly on ${time} ${period} every ${day}`;
    case ActionFrequency.MONTHLY:
      const splitDate = date ? date.split('-') : [];
      const dayOfMonth = splitDate.length === 3 ? splitDate[2] : '';
      return `Monthly on ${time} ${period} every ${dayOfMonth}th`;
    case ActionFrequency.DATAMART:
      return 'After Table';
    default:
      return 'Invalid Schedule';
  }
};
