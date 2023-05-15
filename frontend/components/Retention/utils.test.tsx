import { RetentionData } from '@lib/domain/retention';
import {
  convertToCohortData,
  convertToIntervalData,
  convertToTrendsData,
} from './utils';

const retentionData: RetentionData[] = [
  {
    granularity: new Date('2022-11-24'),
    interval: 0,
    intervalName: 'day 0',
    initialUsers: 202,
    retainedUsers: 113,
    retentionRate: 55.94,
  },
  {
    granularity: new Date('2022-11-25'),
    interval: 0,
    intervalName: 'day 0',
    initialUsers: 230,
    retainedUsers: 112,
    retentionRate: 48.7,
  },
  {
    granularity: new Date('2022-11-26'),
    interval: 1,
    intervalName: 'day 1',
    initialUsers: 206,
    retainedUsers: 108,
    retentionRate: 52.43,
  },
  {
    granularity: new Date('2022-11-27'),
    interval: 1,
    intervalName: 'day 1',
    initialUsers: 202,
    retainedUsers: 105,
    retentionRate: 51.98,
  },
  {
    granularity: new Date('2022-11-26'),
    interval: 2,
    intervalName: 'day 2',
    initialUsers: 206,
    retainedUsers: 108,
    retentionRate: 52.43,
  },
  {
    granularity: new Date('2022-11-27'),
    interval: 2,
    intervalName: 'day 2',
    initialUsers: 202,
    retainedUsers: 105,
    retentionRate: 51.98,
  },
];

describe('Data transformation for retention', () => {
  it('should convert retention data to trends data for interval i', () => {
    expect(convertToTrendsData(retentionData, 0)).toEqual([
      {
        granularity: new Date('2022-11-24'),
        retainedUsers: 113,
        retentionRate: 55.94,
      },
      {
        granularity: new Date('2022-11-25'),
        retainedUsers: 112,
        retentionRate: 48.7,
      },
    ]);
  });

  it('should convert retention data to interval data for page p', () => {
    expect(convertToIntervalData(retentionData, 0, 10)).toEqual({
      count: 3,
      data: [
        { name: 'day 0', value: 52.08 },
        { name: 'day 1', value: 52.21 },
        { name: 'day 2', value: 52.21 },
      ],
    });
  });

  it('should convert retention data to cohort table data', () => {
    expect(convertToCohortData(retentionData)).toEqual([
      {
        cohort: new Date('2022-11-24'),
        intervals: { 'day 0': 55.94 },
        size: 202,
      },
      {
        cohort: new Date('2022-11-25'),
        intervals: { 'day 0': 48.7 },
        size: 230,
      },
    ]);
  });
});
