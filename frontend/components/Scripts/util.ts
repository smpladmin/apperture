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

export const isValidSchedule = (schedule: Schedule) => {
  const { frequency, time, period, day, date } = schedule || {};

  switch (frequency) {
    case ActionFrequency.HOURLY:
      return true;
    case ActionFrequency.DAILY:
      return time !== undefined && period !== undefined;
    case ActionFrequency.WEEKLY:
      return time !== undefined && period !== undefined && day !== undefined;
    case ActionFrequency.MONTHLY:
      return time !== undefined && period !== undefined && date !== undefined;
    default:
      return false;
  }
};

export const getTableName = (name: string) => {
  let fileName = name.trim();

  const punctuationRegex = /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g;
  const tableNameWithoutPunctuation = fileName.replace(punctuationRegex, '');
  const tableName = tableNameWithoutPunctuation.split(/\s+/).join('_');

  return tableName;
};

export const describeSchedule = (schedule: Schedule) => {
  const { frequency, time, period, day, date } = schedule || {};

  switch (frequency) {
    case ActionFrequency.HOURLY:
      return 'Every Hour';
    case ActionFrequency.DAILY:
      return `Daily on ${time} ${period}`;
    case ActionFrequency.WEEKLY:
      return `Weekly on ${time} ${period} every ${day}`;
    case ActionFrequency.MONTHLY:
      const splitDate = date ? date.split('-') : [];
      const dayOfMonth = splitDate.length === 3 ? splitDate[2] : '';
      return `Monthly on ${time} ${period} at ${dayOfMonth}`;
    default:
      return 'Invalid Schedule';
  }
};
