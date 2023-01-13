import {
  FilterOptionMenuType,
  SegmentFilterDataType,
} from '@lib/domain/segment';

export const FilterOptionMenu: FilterOptionMenuType[] = [
  {
    id: 'Data Type',
    label: 'Data Type',
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
        id: 'Bool',
        label: SegmentFilterDataType.BOOL,
        submenu: [],
      },
    ],
  },
];
