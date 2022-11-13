import Fuse from 'fuse.js';

export const getSearchResult = (
  data: any[],
  query: string,
  options: Fuse.IFuseOptions<any>
) => {
  const fuse = new Fuse(data, options);
  return fuse.search(query).map((result) => result.item);
};

export const formatDatalabel = (datalabel: number) => {
  if (datalabel > 999999) {
    return Math.round(datalabel / 100000) / 10 + 'Mn';
  } else if (datalabel > 999) {
    return Math.round(datalabel / 100) / 10 + 'K';
  } else {
    return datalabel + '';
  }
};

export const convertISODateToReadableDate = (isoDate: string) => {
  const date = new Date(isoDate);
  const month = date.toLocaleString('default', { month: 'short' });
  let day = date.getDate().toString();
  if (Number(day) < 10) {
    day = '0' + day;
  }

  return `${day}-${month}`;
};

export const getPercentageOfHits = (nodeHits: number, totalHits: number) => {
  // rounding off to 1 digit after decimal
  return Math.round((nodeHits / totalHits) * 1000) / 10;
};
