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
    interval: 0,
    intervalName: 'day 0',
    initialUsers: 237,
    retainedUsers: 119,
    retentionRate: 50.2,
  },
  {
    granularity: new Date('2022-11-24'),
    interval: 1,
    intervalName: 'day 1',
    initialUsers: 202,
    retainedUsers: 105,
    retentionRate: 51.98,
  },
  {
    granularity: new Date('2022-11-25'),
    interval: 1,
    intervalName: 'day 1',
    initialUsers: 202,
    retainedUsers: 105,
    retentionRate: 51.98,
  },
  {
    granularity: new Date('2022-11-24'),
    interval: 2,
    intervalName: 'day 2',
    initialUsers: 206,
    retainedUsers: 108,
    retentionRate: 52.43,
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
      {
        granularity: new Date('2022-11-26'),
        retainedUsers: 119,
        retentionRate: 50.2,
      },
    ]);
  });

  it('should convert retention data to interval data for page p', () => {
    expect(convertToIntervalData(retentionData, 0, 10)).toEqual({
      count: 3,
      data: [
        { name: 'day 0', value: 51.42 },
        { name: 'day 1', value: 51.98 },
        { name: 'day 2', value: 52.43 },
      ],
    });
  });

  it('should convert retention data to cohort table data', () => {
    expect(convertToCohortData(retentionData)).toEqual([
      {
        cohort: new Date('2022-11-24'),
        intervals: { 'day 0': 55.94, 'day 1': 51.98, 'day 2': 52.43 },
        size: 202,
      },
      {
        cohort: new Date('2022-11-25'),
        intervals: { 'day 0': 48.7, 'day 1': 51.98 },
        size: 230,
      },
      {
        cohort: new Date('2022-11-26'),
        intervals: { 'day 0': 50.2 },
        size: 237,
      },
    ]);
  });

  it('should convert retention data to cohort table data when input is an empty array', () => {
    expect(convertToCohortData([])).toEqual([]);
  });

  it('should convert retention data to cohort table data when input is an array with a single element', () => {
    expect(
      convertToCohortData([
        {
          granularity: new Date('2022-11-24'),
          interval: 0,
          intervalName: 'day 0',
          initialUsers: 202,
          retainedUsers: 113,
          retentionRate: 55.94,
        },
      ])
    ).toEqual([
      {
        cohort: new Date('2022-11-24'),
        intervals: { 'day 0': 55.94 },
        size: 202,
      },
    ]);
  });
});
