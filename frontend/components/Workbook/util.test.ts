import { cloneDeep, range } from 'lodash';
import {
  add,
  calculateMaxDecimalPoints,
  divide,
  evaluateExpression,
  expressionTokenRegex,
  fillHeaders,
  fillRows,
  formatNumber,
  generateOtherColumns,
  multiply,
  power,
  subtract,
} from './util';
import { ColumnType } from '@lib/domain/workbook';

describe('Spreadhsheet Utils', () => {
  describe('fillRowsAndColumns', () => {
    let data: any[];
    let headers: any[];

    const operandOne = [
      192, 201, 3, 36, 12, 41, 4, 42, 4, 41, 2, 41, 34, 124, 12, 4,
    ];
    const operandTwo = [
      82, 47, 100, 10, 35, 95, 83, 47, 72, 100, 79, 92, 28, 7, 14, 22,
    ];

    beforeEach(() => {
      data = [
        {
          index: { original: 1, display: 1 },
          event_name: { original: 'Video_Seen', display: 'Video_Seen' },
        },
        {
          index: { original: 2, display: 2 },
          event_name: { original: 'AppOpen', display: 'AppOpen' },
        },
        {
          index: { original: 3, display: 3 },
          event_name: { original: 'WebView_Open', display: 'WebView_Open' },
        },
        {
          index: { original: 4, display: 4 },
          event_name: { original: 'Video_Seen', display: 'Video_Seen' },
        },
        {
          index: { original: 5, display: 5 },
          event_name: { original: 'AppOpen', display: 'AppOpen' },
        },
        {
          index: { original: 6, display: 6 },
          event_name: { original: 'ae_session', display: 'ae_session' },
        },
        {
          index: { original: 7, display: 7 },
          event_name: { original: 'Login', display: 'Login' },
        },
        {
          index: { original: 8, display: 8 },
          event_name: { original: 'Chapter_Click', display: 'Chapter_Click' },
        },
        {
          index: { original: 9, display: 9 },
          event_name: { original: 'Chapter_Click', display: 'Chapter_Click' },
        },
        {
          index: { original: 10, display: 10 },
          event_name: { original: 'Topic_Click', display: 'Topic_Click' },
        },
      ];
      headers = [{ name: 'event_name', type: ColumnType.QUERY_HEADER }];
    });

    it('should fill empty rows in the incoming data till 1000 index', () => {
      const res = fillRows(data, headers);

      const otherKeys = generateOtherColumns(headers);
      const updatedData = cloneDeep(data).map((d) => {
        otherKeys.forEach((key) => {
          d[key.name] = { original: '', display: '' };
        });
        return d;
      });

      expect(res.length).toBe(1000);
      expect(res.slice(0, 10)).toEqual(updatedData);
    });

    it('should fill empty rows when data is empty', () => {
      const res = fillRows([], []);
      expect(res.length).toBe(1000);
    });

    it('should filld empty columns till Z index', () => {
      const res = fillHeaders(headers);

      expect(res.length).toBe(27);
      expect(res.slice(0, 2)).toEqual([
        { name: 'index', type: ColumnType.QUERY_HEADER },
        { name: 'event_name', type: ColumnType.QUERY_HEADER },
      ]);
      expect(res.slice(2, 27)).toEqual(
        range(1, 26).map((i) => ({
          name: String.fromCharCode(65 + i),
          type: ColumnType.COMPUTED_HEADER,
        }))
      );
    });

    it('should evaluvate the BODMAS expression', () => {
      const lookup_table = {
        A: [231],
        B: [829],
        C: [1230],
        D: [341],
        E: [937],
        F: [20120],
        '100': [100],
      };
      const expression = '((F-C)*(A+B)/100)*D';
      const parsedExpresession = expression.match(expressionTokenRegex);
      const res = evaluateExpression(
        parsedExpresession as string[],
        lookup_table
      );
      expect(res).toEqual([68279794]);
    });

    it('should sum the elements of the two arrays', () => {
      const res = add(operandOne, operandTwo);

      expect(res).toEqual([
        274, 248, 103, 46, 47, 136, 87, 89, 76, 141, 81, 133, 62, 131, 26, 26,
      ]);
    });

    it('should subtract the elements of the two arrays', () => {
      const res = subtract(operandOne, operandTwo);
      expect(res).toEqual([
        110, 154, -97, 26, -23, -54, -79, -5, -68, -59, -77, -51, 6, 117, -2,
        -18,
      ]);
    });

    it('should multiply the elements of the two arrays', () => {
      const res = multiply(operandOne, operandTwo);

      expect(res).toEqual([
        15744, 9447, 300, 360, 420, 3895, 332, 1974, 288, 4100, 158, 3772, 952,
        868, 168, 88,
      ]);
    });

    it('should divide the elements of the two arrays', () => {
      const res = divide(operandOne, operandTwo);

      expect(res).toEqual([
        2.341463414634146, 4.276595744680851, 0.03, 3.6, 0.34285714285714286,
        0.43157894736842106, 0.04819277108433735, 0.8936170212765957,
        0.05555555555555555, 0.41, 0.02531645569620253, 0.44565217391304346,
        1.2142857142857142, 17.714285714285715, 0.8571428571428571,
        0.18181818181818182,
      ]);
    });

    it('should square the elements of the first array', () => {
      const res = power(operandOne, new Array(16).fill(2));

      expect(res).toEqual([
        36864, 40401, 9, 1296, 144, 1681, 16, 1764, 16, 1681, 4, 1681, 1156,
        15376, 144, 16,
      ]);
    });
  });

  describe('calculateMaxDecimalPoints', () => {
    it('should return 0 for an empty array', () => {
      const result = calculateMaxDecimalPoints([]);
      expect(result).toBe(0);
    });

    it('should return 3 for an array with numbers having 3 decimal places', () => {
      const input = [
        { original: 12.34, display: '12.34' },
        { original: 56.789, display: '56.789' },
      ];
      const result = calculateMaxDecimalPoints(input);
      expect(result).toBe(3);
    });

    it('should return 0 if there are no numbers in the array', () => {
      const input = [
        { original: 'string1', display: 'string1' },
        { original: 'string2', display: 'string2' },
      ];
      const result = calculateMaxDecimalPoints(input);
      expect(result).toBe(0);
    });

    it('should return 8 for a mixed array of numbers and strings where max decimal places is 8 in 1.23456789', () => {
      const input = [
        { original: 1.23456789, display: '1.23456789' },
        { original: '12.3456789', display: '12.3456789' },
        { original: 123.456789, display: '123.456789' },
      ];
      const result = calculateMaxDecimalPoints(input);
      expect(result).toBe(8);
    });
  });

  describe('formatNumber', () => {
    it('should return the input value as-is if it is not a number', () => {
      const input = 'abc';
      const format = { percent: false, decimal: 2 };
      const result = formatNumber(input, format);
      expect(result).toBe(input);
    });

    it('should format a number as a percentage with 2 decimal places', () => {
      const input = 0.1234;
      const format = { percent: true, decimal: 2 };
      const result = formatNumber(input, format);
      expect(result).toBe('12.34%');
    });

    it('should format a number without percentage symbol with 3 decimal places', () => {
      const input = 45.6789;
      const format = { percent: false, decimal: 3 };
      const result = formatNumber(input, format);
      expect(result).toBe('45.679');
    });

    it('should format a number as a percentage with 0 decimal places', () => {
      const input = 0.1234;
      const format = { percent: true, decimal: 0 };
      const result = formatNumber(input, format);
      expect(result).toBe('12%');
    });

    it('should handle negative numbers and format as a percentage with 1 decimal place', () => {
      const input = -0.5678;
      const format = { percent: true, decimal: 1 };
      const result = formatNumber(input, format);
      expect(result).toBe('-56.8%');
    });

    it('should handle zero and format as a percentage with 2 decimal places', () => {
      const input = 0;
      const format = { percent: true, decimal: 2 };
      const result = formatNumber(input, format);
      expect(result).toBe('0.00%');
    });
  });
});
