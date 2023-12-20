import {
  APIMeta,
  ActionFrequency,
  GoogleSheetMeta,
  Schedule,
  TableMeta,
  TimePeriod,
} from '@lib/domain/datamartActions';
import {
  describeSchedule,
  getTableName,
  isValidMeta,
  isValidSchedule,
} from './util';

describe('isValidMeta', () => {
  const validAPIMeta: APIMeta = {
    url: 'https://api.example.com/data',
    headers: 'Authorization: Bearer token',
  };

  const validTableMeta: TableMeta = {
    name: 'Users',
  };

  const validGoogleSheetMeta: GoogleSheetMeta = {
    spreadsheet: {
      id: '12345',
      name: 'SheetName',
    },
    sheet: 'Sheet1',
  };

  const invalidMeta: {} = {};

  it('should return true for valid APIMeta', () => {
    expect(isValidMeta(validAPIMeta)).toBe(true);
  });

  it('should return true for valid TableMeta', () => {
    expect(isValidMeta(validTableMeta)).toBe(true);
  });

  it('should return true for valid GoogleSheetMeta', () => {
    expect(isValidMeta(validGoogleSheetMeta)).toBe(true);
  });

  it('should return false for invalid meta', () => {
    expect(isValidMeta(invalidMeta)).toBe(false);
  });

  it('should return false for null meta', () => {
    expect(isValidMeta({})).toBe(false);
  });

  it('should return false for invalid APIMeta', () => {
    const invalidAPIMeta: APIMeta = {
      url: 'https://api.example.com/data',
      headers: '',
    };
    expect(isValidMeta(invalidAPIMeta)).toBe(false);
  });

  it('should return false for invalid GoogleSheetMeta', () => {
    const invalidGoogleSheetMeta: GoogleSheetMeta = {
      spreadsheet: {
        id: '12345',
        name: 'SheetName',
      },
      sheet: '',
    };
    expect(isValidMeta(invalidGoogleSheetMeta)).toBe(false);
  });
});

describe('isValidSchedule and describe schedule', () => {
  const validHourlySchedule: Schedule = {
    frequency: ActionFrequency.HOURLY,
  };

  const validDailySchedule: Schedule = {
    frequency: ActionFrequency.DAILY,
    time: '12:00',
    period: TimePeriod.AM,
  };

  const validWeeklySchedule: Schedule = {
    frequency: ActionFrequency.WEEKLY,
    time: '08:00',
    period: TimePeriod.AM,
    day: 'Monday',
  };

  const validMonthlySchedule: Schedule = {
    frequency: ActionFrequency.MONTHLY,
    time: '10:30',
    period: TimePeriod.AM,
    date: '2023-10-15',
  };

  const invalidSchedule: Schedule = {
    frequency: 'invalid_frequency' as ActionFrequency,
  };

  it('should return true for valid hourly schedule', () => {
    expect(isValidSchedule(validHourlySchedule)).toBe(true);
  });

  it('should return true for valid daily schedule', () => {
    expect(isValidSchedule(validDailySchedule)).toBe(true);
  });

  it('should return true for valid weekly schedule', () => {
    expect(isValidSchedule(validWeeklySchedule)).toBe(true);
  });

  it('should return true for valid monthly schedule', () => {
    expect(isValidSchedule(validMonthlySchedule)).toBe(true);
  });

  it('should return false for invalid schedule', () => {
    expect(isValidSchedule(invalidSchedule)).toBe(false);
  });

  it('should return false for null schedule', () => {
    // @ts-ignore
    expect(isValidSchedule(null)).toBe(false);
  });

  it('should describe hourly schedule', () => {
    expect(describeSchedule(validHourlySchedule)).toBe('Every Hour');
  });

  it('should describe daily schedule', () => {
    expect(describeSchedule(validDailySchedule)).toBe('Daily on 12:00 AM');
  });

  it('should describe weekly schedule', () => {
    expect(describeSchedule(validWeeklySchedule)).toBe(
      'Weekly on 08:00 AM every Monday'
    );
  });

  it('should describe monthly schedule', () => {
    expect(describeSchedule(validMonthlySchedule)).toBe(
      'Monthly on 10:30 AM every 15th'
    );
  });
});

describe('getTableName', () => {
  it('should convert name to table name without punctuation', () => {
    const nameWithPunctuation = 'Table, with! Punctuation';
    const expectedTableName = 'Table_with_Punctuation';

    expect(getTableName(nameWithPunctuation)).toBe(expectedTableName);
  });

  it('should convert name to table name with spaces replaced by underscores', () => {
    const nameWithSpaces = 'Table Name With Spaces';
    const expectedTableName = 'Table_Name_With_Spaces';

    expect(getTableName(nameWithSpaces)).toBe(expectedTableName);
  });

  it('should handle empty string and return empty string', () => {
    expect(getTableName('')).toBe('');
  });

  it('should handle string with only punctuation and return empty string', () => {
    expect(getTableName('!@#$%^&*()')).toBe('');
  });

  it('should handle string with only spaces and return empty string', () => {
    expect(getTableName('      ')).toBe('');
  });

  it('should handle string with mixed punctuation, spaces, and characters', () => {
    const mixedString =
      'Hello! This is a Table Name with $pecial Characters & Spaces!';
    const expectedTableName =
      'Hello_This_is_a_Table_Name_with_pecial_Characters_Spaces';

    expect(getTableName(mixedString)).toBe(expectedTableName);
  });
});
