import { Box, IconButton } from '@chakra-ui/react';
import { FilterOperatorsDatatypeMap } from '@components/Segments/util';
import {
  FilterOptionMenuType,
  SegmentFilter,
  SegmentFilterDataType,
  WhereSegmentFilter,
} from '@lib/domain/segment';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import React, { useRef, useState } from 'react';
import FilterOptionsMenu from './FilterOptionMenu';
import { FilterOptionMenu } from './util';

type FilterOptionsProps = {
  index: number;
  filter: WhereSegmentFilter;
  filters: SegmentFilter[];
  updateGroupsState: Function;
};

const FilterOptions = ({
  index,
  filter,
  filters,
  updateGroupsState,
}: FilterOptionsProps) => {
  const [isFilterOptionsListOpen, setIsFilterOptionsListOpen] = useState(false);

  const selectFilterOptions = useRef(null);
  useOnClickOutside(selectFilterOptions, () =>
    setIsFilterOptionsListOpen(false)
  );

  const handleFilterTypeUpdate = (menu: FilterOptionMenuType) => {
    setIsFilterOptionsListOpen(false);
    const selectedDatatype = menu.label as SegmentFilterDataType;
    if ((filter as WhereSegmentFilter).datatype === selectedDatatype) return;

    const updatedFilters = [...filters];
    updatedFilters[index]['operator'] =
      FilterOperatorsDatatypeMap[selectedDatatype][0];
    updatedFilters[index]['values'] = [];
    (updatedFilters[index] as WhereSegmentFilter)['datatype'] =
      selectedDatatype;

    updateGroupsState(updatedFilters);
  };

  return (
    <Box position={'relative'} ref={selectFilterOptions}>
      <Box>
        <IconButton
          aria-label="delete"
          size={'sm'}
          icon={<i className="ri-more-fill"></i>}
          onClick={() => setIsFilterOptionsListOpen(true)}
          bg={'white.DEFAULT'}
          variant={'secondary'}
          data-testid={'change-datatype'}
        />
      </Box>
      {isFilterOptionsListOpen ? (
        <Box
          position={'absolute'}
          zIndex={1}
          borderRadius={'12'}
          py={'3'}
          borderWidth={'0.4px'}
          borderColor={'grey.100'}
          bg={'white.DEFAULT'}
          shadow={'0px 0px 4px rgba(0, 0, 0, 0.12)'}
          maxH={'100'}
          w={'auto'}
        >
          {FilterOptionMenu.map((menu) => (
            <FilterOptionsMenu
              menu={menu}
              key={menu.id}
              onSubmit={handleFilterTypeUpdate}
              datatype={filter.datatype}
            />
          ))}
        </Box>
      ) : null}
    </Box>
  );
};

export default FilterOptions;
