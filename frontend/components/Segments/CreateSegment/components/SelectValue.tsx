import { Box, Text } from '@chakra-ui/react';
import SearchableCheckBoxDropdown from '@components/SearchableDropdown/SearchableCheckboxDropdown';
import { SegmentFilter } from '@lib/domain/segment';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import { getEventPropertiesValue } from '@lib/services/datasourceService';
import { useRouter } from 'next/router';
import React, { ChangeEvent, useEffect, useRef, useState } from 'react';

type SelectValueProps = {
  filter: SegmentFilter;
  filters: SegmentFilter[];
  setFilters: Function;
  index: number;
};

const SelectValue = ({
  filter,
  filters,
  setFilters,
  index,
}: SelectValueProps) => {
  const [isFilterValuesListOpen, setIsFilterValuesListOpen] =
    useState<boolean>(true);
  const [loadingPropertyValues, setLoadingPropertyValues] =
    useState<boolean>(false);
  const [eventPropertiesValues, setEventPropertiesValues] = useState<string[]>(
    []
  );
  const [filterValues, setFilterValues] = useState<string[]>([]);
  const [areAllValuesSelected, setAreAllValuesSelected] =
    useState<boolean>(false);

  const router = useRouter();
  const { dsId } = router.query;

  const eventValueRef = useRef(null);
  useOnClickOutside(eventValueRef, () => setIsFilterValuesListOpen(false));

  useEffect(() => {
    const fetchEventPropertiesValue = async () => {
      const response = await getEventPropertiesValue(
        dsId as string,
        filter?.operand
      );
      // TODO: to remove slice once we add search in all dropdowns and implement infinite scroll
      // adding '(empty string)' is a workaround to handle '' string case for property values
      const transformedResponse = response.map((res: any) =>
        !res[0] ? '(empty string)' : res[0]
      );

      setEventPropertiesValues(transformedResponse);
      setLoadingPropertyValues(false);
    };
    setLoadingPropertyValues(true);
    fetchEventPropertiesValue();
    setFilterValues([]);
  }, [filter.operand]);

  useEffect(() => {
    // updated filter values whenever a filter changes so that selected values are checked when dropdown is opened
    setFilterValues(filter.values);
  }, [filters]);

  useEffect(() => {
    // check 'Select all' checkbox if all the options are selected
    if (
      filterValues.length === eventPropertiesValues.length &&
      !loadingPropertyValues
    ) {
      setAreAllValuesSelected(true);
    } else {
      setAreAllValuesSelected(false);
    }
  }, [filterValues, eventPropertiesValues]);

  const handleSelectValues = () => {
    setIsFilterValuesListOpen(false);

    const updatedFilters = [...filters];
    updatedFilters[index]['values'] = filterValues;
    setFilters(updatedFilters);
  };

  const handleAllSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    if (checked) {
      setAreAllValuesSelected(true);
      setFilterValues(eventPropertiesValues.map((property) => property));
    } else {
      setAreAllValuesSelected(false);
      setFilterValues([]);
    }
  };

  const handleCheckboxChange = (values: string[]) => {
    setAreAllValuesSelected(false);
    setFilterValues(values);
  };

  const getValuesText = (values: string[]) => {
    if (!values.length) return 'Select value...';
    if (values.length <= 2) return values.join(', ');
    return `${values[0]}, ${values[1]} or ${values.length - 2} more`;
  };

  return (
    <Box position={'relative'} ref={eventValueRef}>
      <Text
        fontSize={'xs-14'}
        lineHeight={'xs-14'}
        fontWeight={'600'}
        px={'2'}
        p={'3'}
        bg={'white.100'}
        cursor={'pointer'}
        onClick={() => setIsFilterValuesListOpen(true)}
        data-testid={'event-property-value'}
      >
        {getValuesText(filter?.values)}
      </Text>
      <SearchableCheckBoxDropdown
        isOpen={isFilterValuesListOpen}
        isLoading={loadingPropertyValues}
        data={eventPropertiesValues}
        onSubmit={handleSelectValues}
        onAllSelect={handleAllSelect}
        onSelect={handleCheckboxChange}
        isSelectAllChecked={areAllValuesSelected}
        selectedValues={filterValues}
      />
    </Box>
  );
};

export default SelectValue;
