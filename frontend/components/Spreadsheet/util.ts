import { range } from 'lodash';

export const fillRows = (data: any[], headers: string[]) => {
  const currentLength = data.length;
  const otherKeys = generateOtherKeys(headers);
  const keys = [...headers, ...otherKeys];
  const gen = range(currentLength + 1, 1001).map((index) => {
    const row: any = {};
    keys.forEach((key) => {
      row[key] = '';
    });
    row['index'] = index;
    return row;
  });

  const dataWitKeys = [...data].map((row) => {
    otherKeys.forEach((key) => {
      row[key] = '';
    });
    return row;
  });

  return [...dataWitKeys, ...gen];
};

export const fillHeaders = (headers: string[]) => {
  const gen = generateOtherKeys(headers);
  const updatedHeaders = [...headers, ...gen];
  updatedHeaders.unshift('index');
  return updatedHeaders;
};

function generateOtherKeys(headers: string[]) {
  return range(headers.length + 1, 27).map((i) =>
    String.fromCharCode(65 + i - 1)
  );
}
