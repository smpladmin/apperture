import { Connection } from '@lib/domain/connections';
import { AppertureGet } from './util';

export const getConnectionsForApp = async (
  dsId: string
): Promise<Connection[]> => {
  const res = await AppertureGet(`/connections/${dsId}`);
  return res.data || [];
};
