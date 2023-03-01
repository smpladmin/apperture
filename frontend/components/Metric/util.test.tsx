import { convertToTableData, convertToTrendData } from './util';

const responseData = [
  {
    name: 'A/B',
    series: [
      {
        breakdown: [
          {
            property: 'bluetooth_enabled',
            value: '0',
          },
        ],
        data: [
          {
            date: '2022-11-24',
            value: 0.3619631901840491,
          },
          {
            date: '2022-11-25',
            value: 0.3337531486146096,
          },
          {
            date: '2022-11-26',
            value: 0.38153310104529614,
          },
          {
            date: '2022-11-27',
            value: 0.354251012145749,
          },
          {
            date: '2022-11-28',
            value: 0.4017543859649123,
          },
        ],
      },
      {
        breakdown: [
          {
            property: 'bluetooth_enabled',
            value: '1',
          },
        ],
        data: [
          {
            date: '2022-11-24',
            value: 0.23163841807909605,
          },
          {
            date: '2022-11-25',
            value: 0.21395348837209302,
          },
          {
            date: '2022-11-26',
            value: 0.38073394495412843,
          },
          {
            date: '2022-11-27',
            value: 0.43636363636363634,
          },
          {
            date: '2022-11-28',
            value: 0.8166666666666667,
          },
        ],
      },
    ],
  },
];

const responseDataWithoutBreakdown = [
  {
    name: 'A/B',
    series: [
      {
        breakdown: [],
        data: [
          {
            date: '2022-11-24',
            value: 0.3619631901840491,
          },
          {
            date: '2022-11-25',
            value: 0.3337531486146096,
          },
          {
            date: '2022-11-26',
            value: 0.38153310104529614,
          },
          {
            date: '2022-11-27',
            value: 0.354251012145749,
          },
          {
            date: '2022-11-28',
            value: 0.4017543859649123,
          },
        ],
      },
    ],
  },
];

export const tableDataWithBreakdown = [
  {
    average: '0.42',
    name: 'A/B',
    propertyValue: '1',
    values: {
      'Nov 24': '0.23163841807909605',
      'Nov 25': '0.21395348837209302',
      'Nov 26': '0.38073394495412843',
      'Nov 27': '0.43636363636363634',
      'Nov 28': '0.8166666666666667',
    },
  },
  {
    average: '0.37',
    name: 'A/B',
    propertyValue: '0',
    values: {
      'Nov 24': '0.3619631901840491',
      'Nov 25': '0.3337531486146096',
      'Nov 26': '0.38153310104529614',
      'Nov 27': '0.354251012145749',
      'Nov 28': '0.4017543859649123',
    },
  },
];

export const trendDataWithBreakdown = [
  {
    date: '2022-11-24',
    series: 'A/B/0',
    value: 0.3619631901840491,
  },
  {
    date: '2022-11-25',
    series: 'A/B/0',
    value: 0.3337531486146096,
  },
  {
    date: '2022-11-26',
    series: 'A/B/0',
    value: 0.38153310104529614,
  },
  {
    date: '2022-11-27',
    series: 'A/B/0',
    value: 0.354251012145749,
  },
  {
    date: '2022-11-28',
    series: 'A/B/0',
    value: 0.4017543859649123,
  },
  {
    date: '2022-11-24',
    series: 'A/B/1',
    value: 0.23163841807909605,
  },
  {
    date: '2022-11-25',
    series: 'A/B/1',
    value: 0.21395348837209302,
  },
  {
    date: '2022-11-26',
    series: 'A/B/1',
    value: 0.38073394495412843,
  },
  {
    date: '2022-11-27',
    series: 'A/B/1',
    value: 0.43636363636363634,
  },
  {
    date: '2022-11-28',
    series: 'A/B/1',
    value: 0.8166666666666667,
  },
];

export const tableDataWithoutBreakdown = [
  {
    average: '0.37',
    name: 'A/B',
    propertyValue: undefined,
    values: {
      'Nov 24': '0.3619631901840491',
      'Nov 25': '0.3337531486146096',
      'Nov 26': '0.38153310104529614',
      'Nov 27': '0.354251012145749',
      'Nov 28': '0.4017543859649123',
    },
  },
];

export const trendDataWithoutBreakdown = [
  {
    date: '2022-11-24',
    series: 'A/B',
    value: 0.3619631901840491,
  },
  {
    date: '2022-11-25',
    series: 'A/B',
    value: 0.3337531486146096,
  },
  {
    date: '2022-11-26',
    series: 'A/B',
    value: 0.38153310104529614,
  },
  {
    date: '2022-11-27',
    series: 'A/B',
    value: 0.354251012145749,
  },
  {
    date: '2022-11-28',
    series: 'A/B',
    value: 0.4017543859649123,
  },
];

it('test convert to table data', () => {
  expect(convertToTableData(responseData)).toEqual(tableDataWithBreakdown);
});

it('test convert to table data without breakdown', () => {
  expect(convertToTableData(responseDataWithoutBreakdown)).toEqual(
    tableDataWithoutBreakdown
  );
});

it('test convert to trend data', () => {
  expect(convertToTrendData(responseData)).toEqual(trendDataWithBreakdown);
});

it('test convert to table data without breakdown', () => {
  expect(convertToTrendData(responseDataWithoutBreakdown)).toEqual(
    trendDataWithoutBreakdown
  );
});
