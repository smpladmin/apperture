import { Box, Flex, Input, Text } from '@chakra-ui/react';
import SearchableCheckboxDropdown from '@components/SearchableDropdown/SearchableCheckboxDropdown';
import {
  FilterDataType,
  FilterOperatorsString,
  WhereFilter,
} from '@lib/domain/common';
import { WhereSegmentFilter } from '@lib/domain/segment';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import { getFilterValuesText } from '@lib/utils/common';
import React, { useRef } from 'react';

type FilterValuesProps = {
  index: number;
  filter: WhereFilter | WhereSegmentFilter;
  valueList: string[];
  selectedValues: string[];
  areAllValuesSelected: boolean;
  isValueDropDownOpen: boolean;
  loadingPropertyValues: boolean;
  setIsValueDropDownOpen: Function;
  handleSetFilterValue: Function;
  handleSubmitValues: Function;
  handleAllSelect: Function;
  handleValueSelection: Function;
};

const FilterValues = ({
  index,
  filter,
  valueList,
  selectedValues,
  areAllValuesSelected,
  loadingPropertyValues,
  isValueDropDownOpen,
  setIsValueDropDownOpen,
  handleSubmitValues,
  handleSetFilterValue,
  handleAllSelect,
  handleValueSelection,
}: FilterValuesProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const eventValueRef = useRef(null);

  useOnClickOutside(eventValueRef, () => setIsValueDropDownOpen(false));

  const showInputValueField = () => {
    const isFilterDataTypeNumber = filter.datatype === FilterDataType.NUMBER;

    const isStringFilterOperatorContains = [
      FilterOperatorsString.CONTAINS,
      FilterOperatorsString.DOES_NOT_CONTAIN,
    ].includes(filter.operator as any);

    return isFilterDataTypeNumber || isStringFilterOperatorContains;
  };

  const showSelectableDropdown = () => {
    const isFilterDataTypeString = filter.datatype === FilterDataType.STRING;

    const hasStringFilterOperator = [
      FilterOperatorsString.IS,
      FilterOperatorsString.IS_NOT,
    ].includes(filter.operator as any);

    return isFilterDataTypeString || hasStringFilterOperator;
  };

  return (
    <>
      {showInputValueField() ? (
        <Input
          ref={inputRef}
          variant={'unstyled'}
          p={'0.5'}
          w={'18'}
          h={'6'}
          type={filter.datatype === FilterDataType.NUMBER ? 'number' : 'text'}
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
              handleSetFilterValue(index, [
                (e.target as HTMLInputElement).value,
              ]);
              inputRef.current?.blur();
            }
          }}
        />
      ) : (
        <>
          {showSelectableDropdown() && (
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
    </>
  );
};

export default FilterValues;
