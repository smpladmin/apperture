import { AppertureGet } from './util';

export const getClickstreamData = async (dsId: string) => {
  const result = await AppertureGet(`/clickstream/${dsId}`);
  return result.data;
};
