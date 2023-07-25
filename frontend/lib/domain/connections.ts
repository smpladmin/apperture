export type ConnectionSource = {
  name: string;
  fields: string[];
  datasource_id: string;
  table_name: string;
  database_name: string;
};

export type ConnectionGroup = {
  provider: string;
  connection_source: ConnectionSource[];
};

export type Connection = {
  server: string;
  connection_data: ConnectionGroup[];
};
