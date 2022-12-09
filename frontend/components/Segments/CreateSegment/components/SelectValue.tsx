import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Flex,
  Text,
} from '@chakra-ui/react';
import LoadingSpinner from '@components/LoadingSpinner';
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
  const [allValuesSelected, setAllValuesSelected] = useState<boolean>(false);

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
      // TODO: to remove slice once we add search in all dropdowns and imlement infinite scroll
      // adding '(empty string)' is a workaround to handle '' string case for property values
      const transformedResponse = response
        .map((res: any) => (!res[0] ? '(empty string)' : res[0]))
        .slice(0, 100);

      setEventPropertiesValues(transformedResponse);
      setLoadingPropertyValues(false);
    };
    setLoadingPropertyValues(true);
    fetchEventPropertiesValue();
    setFilterValues([]);
  }, [filter.operand]);

  useEffect(() => {
    // check 'Select all' checkbox if all the options are selected
    if (
      filterValues.length === eventPropertiesValues.length &&
      !loadingPropertyValues
    ) {
      setAllValuesSelected(true);
    } else {
      setAllValuesSelected(false);
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
      setAllValuesSelected(true);
      setFilterValues(eventPropertiesValues.map((property) => property));
    } else {
      setAllValuesSelected(false);
      setFilterValues([]);
    }
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
      {isFilterValuesListOpen ? (
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
          {loadingPropertyValues ? (
            <Flex
              w={'80'}
              h={'80'}
              alignItems={'center'}
              justifyContent={'center'}
            >
              <LoadingSpinner />
            </Flex>
          ) : (
            <Flex direction={'column'} minW={'80'} gap={'3'}>
              <Box overflowY={'auto'} maxHeight={'82'}>
                <Checkbox
                  colorScheme={'radioBlack'}
                  px={'2'}
                  py={'3'}
                  w={'full'}
                  isChecked={allValuesSelected}
                  onChange={handleAllSelect}
                  _hover={{
                    bg: 'white.100',
                  }}
                  data-testid={'select-all-values'}
                >
                  <Text
                    fontSize={'xs-14'}
                    lineHeight={'xs-14'}
                    fontWeight={'medium'}
                    cursor={'pointer'}
                  >
                    {'Select all'}
                  </Text>
                </Checkbox>
                <CheckboxGroup
                  value={filterValues}
                  onChange={(values: string[]) => {
                    setAllValuesSelected(false);
                    setFilterValues(values);
                  }}
                >
                  {eventPropertiesValues.map((value) => {
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
                        <Checkbox colorScheme={'radioBlack'} value={value}>
                          <Text
                            fontSize={'xs-14'}
                            lineHeight={'xs-14'}
                            fontWeight={'medium'}
                            cursor={'pointer'}
                          >
                            {value}
                          </Text>
                        </Checkbox>
                      </Flex>
                    );
                  })}
                </CheckboxGroup>
              </Box>
              <Button
                w="full"
                bg={'black.100'}
                color={'white.DEFAULT'}
                variant={'primary'}
                onClick={handleSelectValues}
                data-testid={'add-event-property-values'}
              >
                Add
              </Button>
            </Flex>
          )}
        </Box>
      ) : null}
    </Box>
  );
};

export default SelectValue;
