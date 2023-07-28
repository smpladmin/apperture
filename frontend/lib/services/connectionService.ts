import { Connection } from '@lib/domain/connections';
import { AppertureGet } from './util';

export const getConnectionsForApp = async (
  dsId: string,
  appId?: string
): Promise<Connection[]> => {
  const res = await AppertureGet(`/connections/${dsId}?appId=${appId}`);
  return res.data || [];
};
