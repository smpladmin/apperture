import Fuse from 'fuse.js';
import { Provider } from './../domain/provider';
import mixPanelLogo from '@assets/images/mixpanel-icon.svg';
import gaLogo from '@assets/images/ga-logo-small.svg';
import clevertapLogo from '@assets/images/clevertap-icon.png';
import amplitudeLogo from '@assets/images/amplitude-icon.svg';
import appertureLogo from '@assets/images/apperture-logo.svg';
import { StaticImageData } from 'next/image';
import { AppWithIntegrations } from '@lib/domain/app';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import {
  ExternalSegmentFilter,
  FilterDataType,
  WhereFilter,
} from '@lib/domain/common';
import {
  replaceEmptyStringPlaceholder,
  replaceFilterValueWithEmptyStringPlaceholder,
} from '@components/Segments/util';

dayjs.extend(utc);
export const DEBOUNCED_WAIT_TIME = 500;
export const dateFormat = 'D MMM YY, h:mm:ss A';

export const formatDatalabel = (datalabel: number): string => {
  if (datalabel > 999999999999) {
    if (Math.round(datalabel / 10000000000) / 10 > 1000) {
      return formatDatalabel(datalabel / 10000000000) + 'Tn';
    }
    return Math.round(datalabel / 10000000000) / 10 + 'Tn';
  } else if (datalabel > 999999999) {
    return Math.round(datalabel / 100000000) / 10 + 'Bn';
  } else if (datalabel > 999999) {
    return Math.round(datalabel / 100000) / 10 + 'Mn';
  } else if (datalabel > 999) {
    return Math.round(datalabel / 100) / 10 + 'K';
  } else {
    return datalabel + '';
  }
};

export const convertISODateToReadableDate = (
  isoDate: string,
  fullDate?: boolean
) => {
  const date = new Date(isoDate);
  const month = date.toLocaleString('default', { month: 'short' });
  const year = date.getFullYear();

  let day = date.getDate().toString();
  if (Number(day) < 10) {
    day = '0' + day;
  }

  let hours = date.getHours();
  let minutes = date.getMinutes().toString();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = Number(minutes) < 10 ? '0' + minutes : minutes;
  const strTime = `${hours}:${minutes}${ampm}`;

  return fullDate ? `${day} ${month} ${year}, ${strTime}` : `${day}-${month}`;
};

export const getPercentageOfHits = (nodeHits: number, totalHits: number) => {
  // rounding off to 1 digit after decimal
  return Math.round((nodeHits / totalHits) * 1000) / 10;
};

export const getProviderLogo = (provider: Provider): StaticImageData => {
  switch (provider) {
    case Provider.GOOGLE:
      return gaLogo;
    case Provider.MIXPANEL:
      return mixPanelLogo;
    case Provider.AMPLITUDE:
      return amplitudeLogo;
    case Provider.CLEVERTAP:
      return clevertapLogo;
    case Provider.APPERTURE:
      return appertureLogo;
    default:
      return gaLogo;
  }
};

export const getSearchResult = (
  data: any[],
  query: string,
  options: Fuse.IFuseOptions<any>
) => {
  const fuse = new Fuse(data, options);
  return fuse.search(query).map((result) => result.item);
};

export const capitalizeFirstLetter = (text: string): string => {
  const capitalized = text?.charAt(0)?.toUpperCase() + text?.slice(1);
  return capitalized;
};

export const getDatasourceById = (
  apps: AppWithIntegrations[],
  datasourceId: string
) => {
  return apps
    .flatMap((app) => app.integrations)
    .flatMap((integration) => integration.datasources)
    .find((datasource) => datasource._id === datasourceId);
};

export const formatDateIntoString = (date: Date, format = 'YYYY-MM-DD') => {
  if (!date) return;
  return dayjs(date).format(format);
};

export const getFilterValuesText = (values: string[]) => {
  if (!values.length) return 'Select value';
  if (values.length <= 2) return values.join(', ');
  return `${values[0]}, ${values[1]}, +${values.length - 2} more`;
};

export const trimLabel = (label: string, size = 15) => {
  return label.length > size + 3 ? label.slice(0, size) + '...' : label;
};

export const isEveryCustomSegmentFilterValid = (filters: WhereFilter[]) => {
  return filters?.every(
    (filter) => filter.values.length || filter.datatype === FilterDataType.BOOL
  );
};

export const isValidSegmentFilter = (
  segmentFilters: ExternalSegmentFilter[]
) => {
  return segmentFilters.every(
    (filter) =>
      (filter.custom.filters.length || filter.segments.length) &&
      isEveryCustomSegmentFilterValid(filter.custom.filters as WhereFilter[])
  );
};

export const replacePlaceholderWithEmptyStringInExternalSegmentFilter = (
  segmentFilters: ExternalSegmentFilter[]
) => {
  return segmentFilters.map((segmentFilter) => {
    const updatedCustomGroup = replaceEmptyStringPlaceholder([
      segmentFilter.custom,
    ])[0];
    return { ...segmentFilter, custom: updatedCustomGroup };
  });
};

export const replaceEmptyStringWithPlaceholderInExternalSegmentFilter = (
  segmentFilters: ExternalSegmentFilter[]
) => {
  return segmentFilters.map((segmentFilter) => {
    const updatedCustomGroup = replaceFilterValueWithEmptyStringPlaceholder([
      segmentFilter.custom,
    ])[0];
    return { ...segmentFilter, custom: updatedCustomGroup };
  });
};

export const getUTCFormmatedDate = (
  date: Date,
  format: string = dateFormat
) => {
  return dayjs.utc(date).local().format(format);
};

export function autoCaptureEventToDescription(
  event: Pick<'elements' | 'event' | 'properties'>,
  shortForm: boolean = false
): string {
  if (event.event !== '$autocapture') {
    return event.event;
  }

  const getVerb = (): string => {
    if (event.properties.$event_type === 'click') {
      return 'clicked';
    }
    if (event.properties.$event_type === 'change') {
      return 'typed something into';
    }
    if (event.properties.$event_type === 'submit') {
      return 'submitted';
    }

    if (event.properties.$event_type === 'touch') {
      return 'pressed';
    }
    return 'interacted with';
  };

  const getTag = (): string => {
    if (event.elements?.[0]?.tag_name === 'a') {
      return 'link';
    } else if (event.elements?.[0]?.tag_name === 'img') {
      return 'image';
    }
    return event.elements?.[0]?.tag_name ?? 'element';
  };

  const getValue = (): string | null => {
    if (event.elements?.[0]?.text) {
      return `${shortForm ? '' : 'with text '}"${event.elements[0].text}"`;
    } else if (event.elements?.[0]?.attributes?.['attr__aria-label']) {
      return `${shortForm ? '' : 'with aria label '}"${
        event.elements[0].attributes['attr__aria-label']
      }"`;
    }
    return null;
  };

  if (shortForm) {
    return [getVerb(), getValue() ?? getTag()].filter((x) => x).join(' ');
  } else {
    const value = getValue();
    return [getVerb(), getTag(), value].filter((x) => x).join(' ');
  }
}
