import { FilterDataType } from '@lib/domain/common';
import { FilterOptionMenuType } from '@lib/domain/segment';

export const FilterOptionMenu: FilterOptionMenuType[] = [
  {
    id: 'Data Type',
    label: 'Data Type',
    submenu: [
      {
        id: 'String',
        label: FilterDataType.STRING,
        submenu: [],
      },
      {
        id: 'Number',
        label: FilterDataType.NUMBER,
        submenu: [],
      },
      {
        id: 'Bool',
        label: FilterDataType.BOOL,
        submenu: [],
      },
    ],
  },
];
