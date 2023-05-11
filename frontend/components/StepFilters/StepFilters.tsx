import { Box, Flex, Text } from '@chakra-ui/react';
import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import { getEventPropertiesValue } from '@lib/services/datasourceService';
import { useRouter } from 'next/router';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import { GREY_500, GREY_700 } from '@theme/index';
import { ArrowElbowDownRight, Trash } from 'phosphor-react';
import {
  FilterConditions,
  FilterDataType,
  FilterOperators,
  FilterOperatorsDatatypeMap,
  FilterOperatorsString,
  ISFilterOperators,
  WhereFilter,
} from '@lib/domain/common';
import SearchableListDropdown from '@components/SearchableDropdown/SearchableListDropdown';
import { trimLabel } from '@lib/utils/common';
import FilterOptions from './components/FilterOptions';
import FilterOperator from './components/FilterOperator';
import FilterValues from './components/FilterValues';

type FilterComponentProps = {
  filter: WhereFilter;
  index: number;
  eventProperties: string[];
  loadingEventProperties: boolean;
  filters: WhereFilter[];
  setFilters: Function;
};

const StepFilter = ({
  index,
  filter,
  filters,
  setFilters,
  eventProperties,
  loadingEventProperties,
}: FilterComponentProps) => {
  const router = useRouter();
  const { dsId } = router.query;

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

  const eventPropertyRef = useRef(null);

  useEffect(() => {
    // check 'Select all' checkbox if all the options are selected
    if (selectedValues.length === valueList?.length && !loadingPropertyValues) {
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
      const transformedResponse = response?.map((res: string[]) =>
        !res[0] ? '(empty string)' : res[0]
      );

      setValueList(transformedResponse);
      setLoadingPropertyValues(false);
    };
    setLoadingPropertyValues(true);
    fetchEventPropertiesValue();
  }, [filter.operand]);

  useOnClickOutside(eventPropertyRef, () => setIsPropertyDropdownOpen(false));

  const handleSetFilterValue = (filterIndex: number, values: string[]) => {
    const stepFilters = [...filters];
    stepFilters[filterIndex]['values'] = values;

    setFilters(stepFilters);
  };

  const handleSetFilterProperty = (filterIndex: number, property: string) => {
    const stepFilters = [...filters];
    stepFilters[filterIndex]['operand'] = property;

    setFilters(stepFilters);
  };

  const handleRemoveFilter = (filterIndex: number) => {
    const stepFilters = [...filters];
    stepFilters.splice(filterIndex, 1);

    if (filterIndex === 0 && stepFilters.length)
      stepFilters[0]['condition'] = FilterConditions.WHERE;

    setFilters(stepFilters);
  };

  const handleFilterDatatypeChange = (
    filterIndex: number,
    selectedDatatype: FilterDataType
  ) => {
    const stepFilters = [...filters];
    stepFilters[filterIndex]['operator'] =
      FilterOperatorsDatatypeMap[selectedDatatype][0];
    stepFilters[filterIndex]['values'] = [];
    stepFilters[filterIndex]['datatype'] = selectedDatatype;

    setFilters(stepFilters);
  };

  const handleOperatorChange = (
    filterIndex: number,
    selectedOperator: FilterOperators
  ) => {
    const stepFilters = [...filters];

    /*
    While changing operator from `is/is_not` to `contains/does_not_contain`
    the filter values element changes from a Selectable Dropdown to an Input Field,
    hence the selected value needs a reset.
    */
    if (stepFilters[filterIndex].datatype === FilterDataType.STRING) {
      const isMatchingFilter =
        ISFilterOperators.includes(
          stepFilters[filterIndex].operator as FilterOperatorsString
        ) ===
        ISFilterOperators.includes(selectedOperator as FilterOperatorsString);

      if (!isMatchingFilter) {
        stepFilters[index].values = [];
      }
    }

    stepFilters[filterIndex].operator = selectedOperator;
    setFilters(stepFilters);
  };

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
                bg={isPropertyDropdownOpen ? 'white.400' : ''}
                _hover={{ background: 'white.400' }}
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

            <FilterOperator
              index={index}
              filter={filter}
              handleOperatorChange={handleOperatorChange}
            />

            <FilterValues
              index={index}
              filter={filter}
              valueList={valueList}
              selectedValues={selectedValues}
              areAllValuesSelected={areAllValuesSelected}
              loadingPropertyValues={loadingPropertyValues}
              isValueDropDownOpen={isValueDropDownOpen}
              setIsValueDropDownOpen={setIsValueDropDownOpen}
              handleSetFilterValue={handleSetFilterValue}
              handleAllSelect={handleAllSelect}
              handleSubmitValues={handleSubmitValues}
              handleValueSelection={handleValueSelection}
            />
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
  );
};

export default StepFilter;
