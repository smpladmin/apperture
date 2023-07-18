import { AppertureGet } from './util';

export const getConnectionsForApp = async (dsId: string) => {
  const res = await AppertureGet(`/connections/${dsId}`);
  return res.data || [];
};
