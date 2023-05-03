import { Box } from '@chakra-ui/react';
import { FilterOptionMenu } from '@components/Segments/CreateSegment/components/QueryBuilder/FilterOptions/util';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import { GREY_500 } from '@theme/index';
import { DotsThreeVertical } from 'phosphor-react';
import React, { useRef, useState } from 'react';
import FilterOptionsMenu from './FilterOptionsMenu';
import {
  FilterDataType,
  FilterOptionMenuType,
  WhereFilter,
} from '@lib/domain/common';

type FilterOptionsProp = {
  index: number;
  isHovered: boolean;
  filter: WhereFilter;
  handleFilterDatatypeChange: Function;
};

const FilterOptions = ({
  index,
  isHovered,
  filter,
  handleFilterDatatypeChange,
}: FilterOptionsProp) => {
  const [isFilterOptionsListOpen, setIsFilterOptionsListOpen] = useState(false);
  const selectFilterOptions = useRef(null);
  useOnClickOutside(selectFilterOptions, () =>
    setIsFilterOptionsListOpen(false)
  );

  const handleUpdate = (filterIndex: number, label: FilterDataType) => {
    handleFilterDatatypeChange(filterIndex, label);
    setIsFilterOptionsListOpen(false);
  };

  return (
    <Box position={'relative'} ref={selectFilterOptions}>
      <Box
        data-testid={'filter-datatype-option'}
        p={'1'}
        fontWeight={'500'}
        color={'grey.200'}
        cursor={'pointer'}
        opacity={isHovered ? 1 : 0}
        onClick={() => {
          setIsFilterOptionsListOpen(true);
        }}
        background={isFilterOptionsListOpen ? 'white.400' : 'none'}
        _hover={{ background: 'white.400' }}
        borderRadius={'4'}
      >
        <DotsThreeVertical size={14} color={GREY_500} />
      </Box>
      {isFilterOptionsListOpen && isHovered ? (
        <Box
          position={'absolute'}
          zIndex={1}
          borderRadius={'8'}
          p={'2'}
          borderWidth={'1px'}
          borderColor={'white.200'}
          bg={'white.DEFAULT'}
          w={'76'}
        >
          {FilterOptionMenu.map((menu) => (
            <FilterOptionsMenu
              key={menu.id}
              menu={menu}
              onSubmit={handleUpdate}
              datatype={filter.datatype}
              filterIndex={index}
            />
          ))}
        </Box>
      ) : null}
    </Box>
  );
};

export default FilterOptions;
