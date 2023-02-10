import { AppertureGet } from './util';

export const getClickStreamData = async (dsId: string) => {
  const result = await AppertureGet('/clickstream/${dsId}');
  return result.data;
};
