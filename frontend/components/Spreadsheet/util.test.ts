import { range } from 'lodash';
import {
  add,
  divide,
  evaluateExpression,
  expressionTokenRegex,
  fillHeaders,
  fillRows,
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
          index: 1,
          event_name: 'Video_Seen',
        },
        {
          index: 2,
          event_name: 'Thumbs_Up',
        },
        {
          index: 3,
          event_name: 'WebView_Open',
        },
        {
          index: 4,
          event_name: 'Video_Seen',
        },
        {
          index: 5,
          event_name: 'AppOpen',
        },
        {
          index: 6,
          event_name: '$ae_session',
        },
        {
          index: 7,
          event_name: 'Login',
        },
        {
          index: 8,
          event_name: '$ae_session',
        },
        {
          index: 9,
          event_name: 'Chapter_Click',
        },
        {
          index: 10,
          event_name: 'Topic_Click',
        },
      ];
      headers = [{ name: 'event_name', type: ColumnType.QUERY_HEADER }];
    });

    it('should fill empty rows in the incoming data till 1000 index', () => {
      const res = fillRows(data, headers);

      expect(res.length).toBe(1000);
      expect(res.map((it: any) => it.index)).toEqual(range(1, 1001));
      expect(res.slice(0, 10)).toEqual(data);
    });

    it('should fill empty rows when data is empty', () => {
      const res = fillRows([], []);
      expect(res.length).toBe(1000);
      expect(res.map((it: any) => it.index)).toEqual(range(1, 1001));
    });

    it('should filld empty columns till Z index', () => {
      const res = fillHeaders(headers);

      expect(res.length).toBe(27);
      expect(res.slice(0, 2)).toEqual([
        { name: 'index', type: ColumnType.QUERY_HEADER },
        { name: 'event_name', type: ColumnType.QUERY_HEADER },
      ]);
      expect(res.slice(2, 27)).toEqual(
        range(1, 26).map((i) => String.fromCharCode(65 + i))
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
});
