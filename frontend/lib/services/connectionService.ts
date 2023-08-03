import { Connection } from '@lib/domain/connections';
import { AppertureGet } from './util';
import { uniqueId } from 'lodash';

export const getConnectionsForApp = async (
  dsId: string,
  appId?: string
): Promise<Connection[]> => {
  const res = await AppertureGet(`/connections/${dsId}?appId=${appId}`);
  const connections = res.data || [];
  return connections.map((c: Connection) => {
    const data = c.connection_data.map((d) => {
      const sources = d.connection_source.map((s) => {
        return { ...s, id: uniqueId(s.datasource_id) };
      });
      return { ...d, connection_source: sources };
    });
    return { ...c, connection_data: data };
  });
};
