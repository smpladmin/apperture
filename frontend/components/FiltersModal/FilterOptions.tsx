import { Checkbox, CheckboxGroup, Flex, Stack, Text } from '@chakra-ui/react';
import { FilterOption, Filters, FilterTypes } from '@lib/domain/filters';

type FilterOptionsProps = {
  options: {
    [key in FilterTypes]: Array<FilterOption>;
  };
  currentFilter: FilterTypes;
  setSelectedFilter: Function;
  selectedFilters: Filters;
};

type FilterOptionProps = {
  option: FilterOption;
};

const FilterOption = ({ option }: FilterOptionProps) => {
  return (
    <Flex as={'label'} gap={'3'} py={'4'} px={'3'}>
      <Checkbox colorScheme={'radioBlack'} value={option.id} />
      <Text
        fontSize={'xs-14'}
        fontWeight={'medium'}
        lineHeight={'xs-14'}
        cursor={'pointer'}
      >
        {option.label}
      </Text>
    </Flex>
  );
};

const FiltersOption = ({
  options,
  currentFilter,
  setSelectedFilter,
  selectedFilters: selectedFilter,
}: FilterOptionsProps) => {
  const setFilterValues = (selected: Array<string>) => {
    const result: Filters = { ...selectedFilter };
    result[currentFilter] = selected;
    setSelectedFilter(result);
  };
  return (
    <Flex direction={'column'} pt={'4'} pl={'7'} w={'full'}>
      <CheckboxGroup
        value={selectedFilter[currentFilter]}
        onChange={setFilterValues}
      >
        <Stack direction={'column'}>
          {options[currentFilter]?.map((option: FilterOption) => (
            <FilterOption key={option.id} option={option} />
          ))}
        </Stack>
      </CheckboxGroup>
    </Flex>
  );
};

export default FiltersOption;
