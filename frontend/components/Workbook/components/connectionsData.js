export const connections = [
  {
    group: 'Clickhouse',
    data: [
      {
        group: 'Mixpanel',
        data: [
          {
            name: 'Mixpanel 1 datasource',
            fields: ['event_name', 'Mixpanel $city', 'properties'],
            datasource_id: '',
            table_name: '',
          },
          {
            name: 'Mixpanel 2 datasource',
            fields: ['Mixpanel event_name', 'Mixpanel $city', 'properties'],
            datasource_id: '',
            table_name: '',
          },
        ],
      },
      {
        group: 'Google',
        data: [
          {
            name: 'Google Analytics 1 datasource falana dhimkana',
            fields: ['event_name', '$city', 'properties'],
            datasource_id: '',
            table_name: '',
          },
          {
            name: 'Google Analytics 2 datasource',
            fields: ['Google event_name', 'Google $city', 'properties'],
            datasource_id: '',
            table_name: '',
          },
          {
            name: 'Google Analytics 1 datasource falana dhimkana',
            fields: ['event_name', '$city', 'properties'],
            datasource_id: '',
            table_name: '',
          },
        ],
      },
      {
        group: 'CSV',
        data: [
          {
            name: 'Apperture 1 datasource',
            fields: ['event_name', '$city', 'properties'],
            datasource_id: '',
            table_name: '',
          },
          {
            name: 'Apperture 2 datasource',
            fields: ['event_name', '$city', 'properties'],
            datasource_id: '',
            table_name: '',
          },
        ],
      },
    ],
  },

  {
    group: 'MYSQL',
    data: [
      {
        group: 'Database',
        data: [
          {
            name: 'Cart',
            fields: ['event_name', '$city', 'properties'],
            datasource_id: '',
            table_name: '',
          },
          {
            name: 'Inventory',
            fields: ['event_name', '$city', 'properties'],
            datasource_id: '',
            table_name: '',
          },
        ],
      },
      {
        group: 'Database',
        data: [
          {
            name: 'Cart',
            fields: ['event_name', '$city', 'properties'],
            datasource_id: '',
            table_name: '',
          },
          {
            name: 'Inventory',
            fields: ['event_name', '$city', 'properties'],
            datasource_id: '',
            table_name: '',
          },
        ],
      },
    ],
  },
];
