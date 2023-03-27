import { Box, Flex, Text } from '@chakra-ui/react';
import SearchableListDropdown from '@components/SearchableDropdown/SearchableListDropdown';
import { FunnelStepFilter } from '@lib/domain/funnel';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import { ArrowElbowDownRight } from 'phosphor-react';
import { GREY_700 } from '@theme/index';
import React, { useRef, useState } from 'react';

type FunnelAddFilterComponentProps = {
  eventProperties: string[];
  loadingEventProperties: boolean;
  handleAddFilter: Function;
  filters: FunnelStepFilter[];
};

const FunnelAddFilterComponent = ({
  eventProperties,
  loadingEventProperties,
  handleAddFilter,
  filters,
}: FunnelAddFilterComponentProps) => {
  const [openDropDown, setOpenDropDown] = useState(false);
  const ref = useRef(null);

  const handleSubmit = (value: string) => {
    setOpenDropDown(false);
    handleAddFilter(value);
  };

  useOnClickOutside(ref, () => setOpenDropDown(false));
  return (
    <Flex width={'full'} direction={'column'} ref={ref}>
      <Flex p={1} alignItems={'center'} gap={2} h={6} mt={2} px={1}>
        <Box opacity={filters.length ? 0 : 1}>
          <ArrowElbowDownRight size={12} color={GREY_700} weight={'bold'} />
        </Box>
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
      </Flex>
      <SearchableListDropdown
        isOpen={openDropDown}
        isLoading={loadingEventProperties}
        data={eventProperties}
        onSubmit={handleSubmit}
        placeholderText={'Search for properties...'}
        width={'96'}
      />
    </Flex>
  );
};

export default FunnelAddFilterComponent;
