import { Flex, Text } from '@chakra-ui/react';
import SearchableListDropdown from '@components/SearchableDropdown/SearchableListDropdown';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import React, { useRef, useState } from 'react';

type MetricAddFilterComponentProps = {
  eventProperties: string[];
  loadingEventProperties: boolean;
  handleAddFilter: Function;
};

const MetricAddFilterComponent = ({
  eventProperties,
  loadingEventProperties,
  handleAddFilter,
}: MetricAddFilterComponentProps) => {
  const [openDropDown, setOpenDropDown] = useState(false);
  const ref = useRef(null);
  const handleClick = () => {
    setOpenDropDown((prevState) => !prevState);
  };

  const handleSubmit = (value: string) => {
    setOpenDropDown(false);
    handleAddFilter(value);
  };

  useOnClickOutside(ref, () => setOpenDropDown(false));
  return (
    <Flex position="relative" width={'full'} direction={'column'} ref={ref}>
      <Text
        data-testid={'add-filter-button'}
        color={'grey.200'}
        fontSize={'xs-12'}
        lineHeight={'xs-16'}
        cursor={'pointer'}
        px={5}
        marginTop={2}
        borderRadius={4}
        _hover={{ color: 'white', background: 'grey.300' }}
        onClick={handleClick}
      >
        +Add Filter
      </Text>
      <SearchableListDropdown
        isOpen={openDropDown}
        isLoading={loadingEventProperties}
        data={eventProperties}
        onSubmit={handleSubmit}
      />
    </Flex>
  );
};

export default MetricAddFilterComponent;
