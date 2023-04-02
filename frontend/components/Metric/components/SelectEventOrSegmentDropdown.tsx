import { Flex, Text } from '@chakra-ui/react';
import Dropdown from '@components/SearchableDropdown/Dropdown';
import { MetricVariant } from '@lib/domain/metric';
import React from 'react';

type SelectEventOrSegmentDropdownProps = {
  isOpen: boolean;
  onSelect: Function;
};

const SelectEventOrSegmentDropdown = ({
  isOpen,
  onSelect,
}: SelectEventOrSegmentDropdownProps) => {
  return (
    <Dropdown isOpen={isOpen} width={'76'}>
      <Flex
        data-testid={'event-option'}
        lineHeight={'xs-18'}
        color={'black'}
        fontSize={'xs-14'}
        fontWeight={500}
        width={'full'}
        p={2}
        borderRadius={8}
        _hover={{
          background: 'white.100',
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(MetricVariant.EVENT);
        }}
      >
        <Text fontSize={'xs-12'} lineHeight={'lh-130'} fontWeight={'500'}>
          Events
        </Text>
      </Flex>
      <Flex
        lineHeight={'xs-18'}
        color={'black'}
        fontSize={'xs-14'}
        fontWeight={500}
        width={'full'}
        p={2}
        borderRadius={8}
        _hover={{
          background: 'white.100',
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(MetricVariant.SEGMENT);
        }}
        pointerEvents={'none'}
      >
        <Text fontSize={'xs-12'} lineHeight={'lh-130'} fontWeight={'500'}>
          Segments
        </Text>
      </Flex>
    </Dropdown>
  );
};

export default SelectEventOrSegmentDropdown;
