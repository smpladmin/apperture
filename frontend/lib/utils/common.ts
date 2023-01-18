import Fuse from 'fuse.js';
import { Provider } from './../domain/provider';
import mixPanelLogo from '@assets/images/mixpanel-icon.svg';
import gaLogo from '@assets/images/ga-logo-small.svg';
import clevertapLogo from '@assets/images/clevertap-icon.png';
import amplitudeLogo from '@assets/images/amplitude-icon.svg';

import { StaticImageData } from 'next/image';

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
