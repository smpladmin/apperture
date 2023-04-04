import { Flex, Text } from '@chakra-ui/react';
import Dropdown from '@components/SearchableDropdown/Dropdown';
import { MetricVariant } from '@lib/domain/metric';
import Image from 'next/image';
import { UsersFour } from 'phosphor-react';
import React from 'react';
import cursorIcon from '@assets/icons/cursor-icon.svg';
import { GREY_600 } from '@theme/index';

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
        width={'full'}
        px={'2'}
        py={'3'}
        borderRadius={'4'}
        _hover={{
          background: 'white.400',
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(MetricVariant.EVENT);
        }}
        gap={'2'}
      >
        <Image src={cursorIcon} alt={'cursor-icon'} />
        <Text
          fontSize={'xs-14'}
          lineHeight={'lh-130'}
          fontWeight={'500'}
          color={'black.500'}
        >
          Events
        </Text>
      </Flex>
      <Flex
        width={'full'}
        px={'2'}
        py={'3'}
        borderRadius={'4'}
        _hover={{
          background: 'white.400',
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(MetricVariant.SEGMENT);
        }}
        pointerEvents={'none'}
        gap={'2'}
        hidden={true} // enable once selecting segment is enabled
      >
        <UsersFour size={18} color={GREY_600} />
        <Text fontSize={'xs-14'} lineHeight={'lh-130'} fontWeight={'500'}>
          Segments
        </Text>
      </Flex>
    </Dropdown>
  );
};

export default SelectEventOrSegmentDropdown;
