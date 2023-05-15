import { cloneDeep } from 'lodash';
import { ExternalSegmentFilter, WhereFilter } from '@lib/domain/common';
import { FunnelStep } from '@lib/domain/funnel';
import {
  IntervalData,
  RetentionData,
  RetentionEvents,
  RetentionTrendsData,
} from '@lib/domain/retention';
import { isEveryCustomSegmentFilterValid } from '@lib/utils/common';

const _hasValidFilterValues = (filters: WhereFilter[]) => {
  return filters.every((filter) => filter.values.length);
};

export const hasValidEvents = (retentionEvents: RetentionEvents) => {
  return retentionEvents.startEvent.event && retentionEvents.goalEvent.event;
};

export const hasValidFilterValuesForAllEvents = (
  retentionEvents: RetentionEvents
) => {
  return (
    _hasValidFilterValues(retentionEvents.startEvent.filters) &&
    _hasValidFilterValues(retentionEvents.goalEvent.filters)
  );
};

export const substituteEmptyStringWithPlaceholder = (
  retentionEvent: FunnelStep,
  reverse = false
) => {
  const toFind = reverse ? '(empty string)' : '';
  const toReplace = reverse ? '' : '(empty string)';
  const updatedFilters = retentionEvent.filters.map((filter) => {
    const emptyStringIndex = filter.values.indexOf(toFind);
    if (emptyStringIndex !== -1) filter.values[emptyStringIndex] = toReplace;
    return filter;
  });
  return { ...retentionEvent, filters: updatedFilters };
};

export const hasValidRetentionEventAndFilters = (
  retentionEvents: RetentionEvents,
  segmentFilters: ExternalSegmentFilter[]
) => {
  return (
    hasValidEvents(retentionEvents) &&
    hasValidFilterValuesForAllEvents(retentionEvents) &&
    isEveryCustomSegmentFilterValid(
      segmentFilters[0].custom.filters as WhereFilter[]
    )
  );
};

export const convertToTrendsData = (
  retentionData: RetentionData[],
  interval: number
): RetentionTrendsData[] => {
  return retentionData
    .filter((obj) => obj.interval === interval)
    .map(
      ({ interval, intervalName, initialUsers, ...retentionTrend }) =>
        retentionTrend
    );
};

export const convertToIntervalData = (
  retentionData: RetentionData[],
  pageNumber: number,
  pageSize: number
): IntervalData => {
  const intervalCount =
    retentionData[retentionData.length - 1]?.interval + 1 || 0;
  const intervalData = [];
  for (
    let i = pageNumber * pageSize;
    i < Math.min((pageNumber + 1) * pageSize, intervalCount);
    i++
  ) {
    const intervalTrendData = retentionData.filter((obj) => obj.interval === i);
    const initialUsers = intervalTrendData.reduce((totalUsers, item) => {
      return totalUsers + item.initialUsers;
    }, 0);
    const retainedUsers = intervalTrendData.reduce((totalUsers, item) => {
      return totalUsers + item.retainedUsers;
    }, 0);
    intervalData.push({
      name: intervalTrendData[0].intervalName,
      value: parseFloat(((retainedUsers / initialUsers) * 100).toFixed(2)),
    });
  }

  return { count: intervalCount, data: intervalData };
};

export const convertToCohortData = (retentionData: RetentionData[]): any[] => {
  const retentionDataClone = cloneDeep(retentionData);
  retentionDataClone.sort(
    (a, b) =>
      new Date(a.granularity).valueOf() - new Date(b.granularity).valueOf()
  );

  const cohortData = [];
  const indices: number[] = [];

  // indices
  retentionDataClone.forEach((td, index) => {
    if (td.interval === 0) indices.push(index);
  });

  // slice and make object
  for (let i = 0; i < indices.length; i++) {
    let chunk: RetentionData[];
    if (i == indices.length - 1) {
      chunk = [retentionDataClone[indices[i]]];
    } else {
      chunk = retentionDataClone.slice(indices[i], indices[i + 1]);
    }

    const rowData: any = {
      cohort: chunk[0].granularity,
      size: chunk[0].initialUsers,
    };

    const intervals: any = {};
    chunk.forEach((ch) => {
      intervals[ch.intervalName] = ch.retentionRate;
    });

    rowData.intervals = intervals;
    cohortData.push(rowData);
  }
  return cohortData;
};
