import {
  FilterOptionMenuType,
  SegmentFilterDataType,
} from '@lib/domain/segment';

export const FilterOptionMenu: FilterOptionMenuType[] = [
  {
    id: 'Add data Type',
    label: 'Add data Type',
    submenu: [
      {
        id: 'String',
        label: SegmentFilterDataType.STRING,
        submenu: [],
      },
      {
        id: 'Number',
        label: SegmentFilterDataType.NUMBER,
        submenu: [],
      },
      {
        id: 'Date',
        label: SegmentFilterDataType.DATETIME,
        submenu: [],
      },
      {
        id: 'Bool',
        label: SegmentFilterDataType.BOOL,
        submenu: [],
      },
    ],
  },
];
