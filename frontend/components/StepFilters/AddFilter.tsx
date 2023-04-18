import { Box, Flex, Text } from '@chakra-ui/react';
import SearchableListDropdown from '@components/SearchableDropdown/SearchableListDropdown';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import { ArrowElbowDownRight } from 'phosphor-react';
import { GREY_700 } from '@theme/index';
import React, { useRef, useState } from 'react';
import { WhereFilter } from '@lib/domain/common';

type FunnelAddFilterComponentProps = {
  eventProperties: string[];
  loadingEventProperties: boolean;
  handleAddFilter: Function;
  filters: WhereFilter[];
  hideIndentIcon?: boolean;
};

const AddFilterComponent = ({
  eventProperties,
  loadingEventProperties,
  handleAddFilter,
  filters,
  hideIndentIcon = false,
}: FunnelAddFilterComponentProps) => {
  const [openDropDown, setOpenDropDown] = useState(false);
  const ref = useRef(null);

  const handleSubmit = (value: string) => {
    setOpenDropDown(false);
    handleAddFilter(value);
  };

  useOnClickOutside(ref, () => setOpenDropDown(false));
  return (
    <Flex width={'full'} direction={'column'}>
      <Flex py={1} alignItems={'center'} gap={2} h={6}>
        <Box opacity={filters.length || hideIndentIcon ? 0 : 1} pl={'1'}>
          <ArrowElbowDownRight size={12} color={GREY_700} weight={'bold'} />
        </Box>
        <Box position={'relative'} ref={ref}>
          <Flex
            alignItems={'center'}
            justifyContent={'center'}
            color={'grey.600'}
            p={1}
            height={6}
            data-testid={'add-filter-button'}
            cursor={'pointer'}
            borderRadius={'4px'}
            _hover={{ color: 'grey.800', background: 'white.400' }}
            onClick={() => setOpenDropDown(true)}
          >
            <Text
              color={'inherit'}
              fontSize={'xs-12'}
              lineHeight={'lh-120'}
              fontWeight={'400'}
            >
              +Filter
            </Text>
          </Flex>
          <SearchableListDropdown
            isOpen={openDropDown}
            isLoading={loadingEventProperties}
            data={eventProperties}
            onSubmit={handleSubmit}
            placeholderText={'Search for properties...'}
            width={'96'}
          />
        </Box>
      </Flex>
    </Flex>
  );
};

export default AddFilterComponent;
