import { range } from 'lodash';
import { fillHeaders, fillRows } from './util';

describe('Spreadhsheet Utils', () => {
  describe('fillRowsAndColumns', () => {
    let data: any[];
    let headers: any[];

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
      headers = ['event_name'];
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
      expect(res.slice(0, 2)).toEqual(['index', 'event_name']);
      expect(res.slice(2, 27)).toEqual(
        range(1, 26).map((i) => String.fromCharCode(65 + i))
      );
    });
  });
});
