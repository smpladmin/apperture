import { Box, Flex, Input, Text } from '@chakra-ui/react';
import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import { getEventPropertiesValue } from '@lib/services/datasourceService';
import { useRouter } from 'next/router';
import SearchableCheckboxDropdown from '@components/SearchableDropdown/SearchableCheckboxDropdown';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import { GREY_500, GREY_700 } from '@theme/index';
import { ArrowElbowDownRight, Trash } from 'phosphor-react';
import { FilterDataType, WhereFilter } from '@lib/domain/common';
import SearchableListDropdown from '@components/SearchableDropdown/SearchableListDropdown';
import { getFilterValuesText, trimLabel } from '@lib/utils/common';
import { WhereSegmentFilter } from '@lib/domain/segment';
import FilterOptions from './components/FilterOptions';

type FilterComponentProps = {
  filter: WhereFilter | WhereSegmentFilter;
  index: number;
  eventProperties: string[];
  loadingEventProperties: boolean;
  handleRemoveFilter: Function;
  handleSetFilterValue: Function;
  handleSetFilterProperty: Function;
  handleFilterDatatypeChange: Function;
};

const StepFilter = ({
  index,
  filter,
  eventProperties,
  loadingEventProperties,
  handleSetFilterProperty,
  handleSetFilterValue,
  handleRemoveFilter,
  handleFilterDatatypeChange,
}: FilterComponentProps) => {
  const router = useRouter();
  const { dsId } = router.query;
  const inputRef = useRef<HTMLInputElement>(null);

  const [isHovered, setIsHovered] = useState(false);
  const [valueList, setValueList] = useState<string[]>([]);
  const [selectedValues, setSelectedValues] = useState<string[]>(
    filter.values || []
  );
  const [loadingPropertyValues, setLoadingPropertyValues] = useState(false);
  const [isValueDropDownOpen, setIsValueDropDownOpen] = useState(
    filter.values.length ? false : true
  );
  const [isPropertyDropdownOpen, setIsPropertyDropdownOpen] = useState(false);
  const [areAllValuesSelected, setAreAllValuesSelected] =
    useState<boolean>(false);

  const eventValueRef = useRef(null);
  const eventPropertyRef = useRef(null);

  useEffect(() => {
    // check 'Select all' checkbox if all the options are selected
    if (selectedValues.length === valueList.length && !loadingPropertyValues) {
      setAreAllValuesSelected(true);
    } else {
      setAreAllValuesSelected(false);
    }
  }, [valueList, selectedValues]);

  useEffect(() => {
    const fetchEventPropertiesValue = async () => {
      const response = await getEventPropertiesValue(
        dsId as string,
        filter.operand
      );

      // adding '(empty string)' is a workaround to handle '' string case for property values
      const transformedResponse = response.map((res: string[]) =>
        !res[0] ? '(empty string)' : res[0]
      );

      setValueList(transformedResponse);
      setLoadingPropertyValues(false);
    };
    setLoadingPropertyValues(true);
    fetchEventPropertiesValue();
  }, [filter.operand]);

  useOnClickOutside(eventValueRef, () => setIsValueDropDownOpen(false));
  useOnClickOutside(eventPropertyRef, () => setIsPropertyDropdownOpen(false));

  const handleSubmitValues = () => {
    handleSetFilterValue(index, selectedValues);
    setIsValueDropDownOpen(false);
  };

  const handleValueSelection = (value: string[]) => {
    setAreAllValuesSelected(false);
    setSelectedValues(value);
  };

  const handleAllSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    if (checked) {
      setAreAllValuesSelected(true);
      setSelectedValues([...valueList]);
    } else {
      setAreAllValuesSelected(false);
      setSelectedValues([]);
    }
  };

  const handlePropertySelection = (property: string) => {
    handleSetFilterProperty(index, property);
    setIsPropertyDropdownOpen(false);

    // reset filter values when operand is changed and open the values dropdown
    handleSetFilterValue(index, []);
    setSelectedValues([]);
    setValueList([]);
    setIsValueDropDownOpen(true);
  };

  return (
    <>
      <Flex
        data-testid={'event-filter'}
        width={'full'}
        direction={'column'}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Flex w={'full'} pl={'1'}>
          <Flex pt={'1'}>
            <ArrowElbowDownRight size={12} color={GREY_700} weight={'bold'} />
          </Flex>
          <Flex justifyContent={'space-between'} w={'full'} pl={'2'}>
            <Flex flexWrap={'wrap'} gap={'1'}>
              <Flex
                alignItems={'center'}
                justifyContent={'center'}
                color={'grey.600'}
                p={1}
                height={6}
                data-testid={'filter-condition'}
                cursor={'pointer'}
                borderRadius={'4px'}
                _hover={{ color: 'grey.800', background: 'white.400' }}
              >
                <Text
                  color={'inherit'}
                  fontSize={'xs-12'}
                  lineHeight={'lh-120'}
                  fontWeight={'400'}
                >
                  {filter.condition}
                </Text>
              </Flex>

              <Box position={'relative'} ref={eventPropertyRef}>
                <Flex
                  alignItems={'center'}
                  justifyContent={'flex-end'}
                  height={6}
                  w={'full'}
                  p={1}
                  borderBottom={'1px'}
                  borderStyle={'dashed'}
                  borderColor={'black.500'}
                  onClick={() => {
                    setIsPropertyDropdownOpen(true);
                  }}
                  cursor={'pointer'}
                >
                  <Text
                    fontSize={'xs-12'}
                    lineHeight={'xs-14'}
                    color={'black.500'}
                  >
                    {trimLabel(filter.operand, 25)}
                  </Text>
                </Flex>
                <SearchableListDropdown
                  isOpen={isPropertyDropdownOpen}
                  isLoading={loadingEventProperties}
                  data={eventProperties}
                  onSubmit={handlePropertySelection}
                  placeholderText={'Search for properties...'}
                  width={'96'}
                />
              </Box>
              <Flex
                alignItems={'center'}
                justifyContent={'center'}
                color={'grey.600'}
                p={1}
                height={6}
                data-testid={'filter-operator'}
                borderRadius={'4px'}
                // _hover={{ color: 'grey.800', background: 'white.400' }}
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

              {filter.datatype === FilterDataType.NUMBER ? (
                <Input
                  ref={inputRef}
                  variant={'unstyled'}
                  p={'0.5'}
                  w={'18'}
                  h={'6'}
                  type={'number'}
                  borderBottom={'1px'}
                  borderStyle={'dashed'}
                  borderRadius={'4px 4px 0 0'}
                  borderColor={'grey.800'}
                  fontSize={'xs-12'}
                  placeholder={'Enter value'}
                  bg={'white.400'}
                  defaultValue={filter.values[0]}
                  onBlur={(e) => {
                    handleSetFilterValue(index, [e.target.value]);
                  }}
                  onKeyDown={(e) => {
                    if (e.key == 'Enter') {
                      handleSetFilterValue(
                        index,
                        (e.target as HTMLInputElement).value
                      );
                      inputRef.current?.blur();
                    }
                  }}
                />
              ) : (
                <>
                  {filter.datatype === FilterDataType.STRING && (
                    <Box position={'relative'} ref={eventValueRef}>
                      <Flex
                        alignItems={'center'}
                        justifyContent={'flex-end'}
                        p={1}
                        w={'full'}
                        overflow={'hidden'}
                        borderBottom={'1px'}
                        borderStyle={'dashed'}
                        borderColor={'grey.800'}
                        onClick={() => {
                          setIsValueDropDownOpen(true);
                        }}
                      >
                        <Text
                          data-testid={'event-filter-values'}
                          cursor={'pointer'}
                          fontSize={'xs-12'}
                          lineHeight={'xs-14'}
                          color={'black.500'}
                          wordBreak={'break-word'}
                        >
                          {getFilterValuesText(filter.values)}
                        </Text>
                      </Flex>
                      <SearchableCheckboxDropdown
                        isOpen={isValueDropDownOpen}
                        isLoading={loadingPropertyValues}
                        data={valueList}
                        onSubmit={handleSubmitValues}
                        onAllSelect={handleAllSelect}
                        onSelect={handleValueSelection}
                        isSelectAllChecked={areAllValuesSelected}
                        selectedValues={selectedValues}
                        width={'96'}
                        placeholderText={'Search for properties...'}
                      />
                    </Box>
                  )}
                </>
              )}
            </Flex>
            <Flex h={'fit-content'}>
              <Box
                p={'1'}
                data-testid={'remove-filter'}
                fontWeight={'500'}
                color={'grey.200'}
                cursor={'pointer'}
                opacity={isHovered ? 1 : 0}
                onClick={() => handleRemoveFilter(index)}
              >
                <Trash size={14} color={GREY_500} />
              </Box>
              <FilterOptions
                index={index}
                isHovered={isHovered}
                filter={filter}
                handleFilterDatatypeChange={handleFilterDatatypeChange}
              />
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </>
  );
};

export default StepFilter;
