import { Box, Flex, Text } from '@chakra-ui/react';
import Dropdown from '@components/SearchableDropdown/Dropdown';
import { FilterOperatorsDatatypeMap, WhereFilter } from '@lib/domain/common';
import { WhereSegmentFilter } from '@lib/domain/segment';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import { capitalizeFirstLetter } from '@lib/utils/common';
import React, { useRef, useState } from 'react';

const FilterOperators = ({
  index,
  filter,
  handleOperatorChange,
}: {
  index: number;
  filter: WhereFilter | WhereSegmentFilter;
  handleOperatorChange: Function;
}) => {
  const [isFilterOperatorsListOpen, setIsFilterOperatorsListOpen] =
    useState(false);

  const selectFilterOperators = useRef(null);
  useOnClickOutside(selectFilterOperators, () =>
    setIsFilterOperatorsListOpen(false)
  );

  const handleSwitchFilterOperators = (value: any) => {
    handleOperatorChange(index, value);
    setIsFilterOperatorsListOpen(false);
  };

  const filterOperatorsValues = FilterOperatorsDatatypeMap[filter.datatype];

  return (
    <Box ref={selectFilterOperators} position={'relative'}>
      <Flex
        alignItems={'center'}
        justifyContent={'center'}
        color={'grey.600'}
        p={1}
        height={6}
        data-testid={'filter-operator'}
        borderRadius={'4'}
        cursor={'pointer'}
        onClick={() => setIsFilterOperatorsListOpen(true)}
        bg={isFilterOperatorsListOpen ? 'white.400' : ''}
        _hover={{ background: 'white.400' }}
      >
        <Text
          color={'inherit'}
          fontSize={'xs-12'}
          lineHeight={'lh-120'}
          fontWeight={'400'}
          whiteSpace={'nowrap'}
        >
          {filter.operator}
        </Text>
      </Flex>
      <Dropdown isOpen={isFilterOperatorsListOpen} width={'76'}>
        <Flex direction={'column'} minW={'15'}>
          {filterOperatorsValues.map((value) => {
            return (
              <Flex
                p={'3'}
                key={value}
                _hover={{
                  bg: 'white.100',
                }}
                onClick={() => handleSwitchFilterOperators(value)}
                data-testid={'filter-operators-options'}
                cursor={'pointer'}
              >
                <Text
                  fontSize={'xs-14'}
                  lineHeight={'xs-14'}
                  fontWeight={'medium'}
                >
                  {capitalizeFirstLetter(value)}
                </Text>
              </Flex>
            );
          })}
        </Flex>
      </Dropdown>
    </Box>
  );
};

export default FilterOperators;
