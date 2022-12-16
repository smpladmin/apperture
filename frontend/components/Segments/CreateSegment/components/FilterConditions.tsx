import { Box, Flex, Text } from '@chakra-ui/react';
import { SegmentFilterConditions } from '@lib/domain/segment';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import React, { useRef, useState } from 'react';

const FilterConditions = ({ conditions, index, setConditions }: any) => {
  const [isFilterConditionsListOpen, setIsFilterConditionsListOpen] =
    useState(false);

  const updateFilterConditions = (value: SegmentFilterConditions) => {
    const newConditions = conditions.map((condition: SegmentFilterConditions) =>
      condition === SegmentFilterConditions.WHERE ? condition : value
    );
    setConditions(newConditions);
    setIsFilterConditionsListOpen(false);
  };
  const filterCondtionsValues = [
    SegmentFilterConditions.AND,
    SegmentFilterConditions.OR,
  ];
  const filterConditionsRef = useRef(null);
  useOnClickOutside(filterConditionsRef, () =>
    setIsFilterConditionsListOpen(false)
  );

  return (
    <Box w={'12'} ref={filterConditionsRef}>
      <Text
        fontSize={'xs-14'}
        lineHeight={'xs-14'}
        fontWeight={'500'}
        color={'grey.200'}
        textAlign={'right'}
        cursor={'pointer'}
        onClick={() => setIsFilterConditionsListOpen(true)}
      >
        {conditions[index]}
      </Text>
      {isFilterConditionsListOpen &&
      conditions[index] !== SegmentFilterConditions.WHERE ? (
        <Box
          position={'absolute'}
          zIndex={1}
          px={'3'}
          py={'3'}
          borderRadius={'12'}
          borderWidth={'0.4px'}
          borderColor={'grey.100'}
          bg={'white.DEFAULT'}
          shadow={'0px 0px 4px rgba(0, 0, 0, 0.12)'}
          maxH={'100'}
          overflowY={'auto'}
          data-testid={'property-values-dropdown-container'}
        >
          {
            <Flex direction={'column'} minW={'15'} gap={'3'}>
              <Box overflowY={'auto'} maxHeight={'82'}>
                {filterCondtionsValues.map((value) => {
                  return (
                    <Flex
                      as={'label'}
                      gap={'3'}
                      px={'2'}
                      py={'3'}
                      key={value}
                      _hover={{
                        bg: 'white.100',
                      }}
                      data-testid={'property-value-dropdown-option'}
                    >
                      <Text
                        fontSize={'xs-14'}
                        lineHeight={'xs-14'}
                        fontWeight={'medium'}
                        cursor={'pointer'}
                        onClick={() => updateFilterConditions(value)}
                      >
                        {value}
                      </Text>
                    </Flex>
                  );
                })}
              </Box>
            </Flex>
          }
        </Box>
      ) : null}
    </Box>
  );
};

export default FilterConditions;
