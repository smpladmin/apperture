import { Box, Divider, Flex, Text } from '@chakra-ui/react';
import { FilterOption, Filters, FilterTypes } from '@lib/domain/filters';
import { Fragment } from 'react';

type FilterCategoryHeaderProps = {
  isCategoryLabel?: boolean;
  categoryLabel: string;
};

const FilterCategoryHeader = ({
  isCategoryLabel = false,
  categoryLabel,
}: FilterCategoryHeaderProps) => {
  return (
    <Flex
      rounded={'lg'}
      alignItems={'center'}
      width={'full'}
      height={{ base: '8', md: '9' }}
    >
      <Text
        pl={'3'}
        fontSize={{ base: 'xs-12', md: 'xs-14' }}
        lineHeight={{ base: 'xs-12', md: 'xs-14' }}
        fontWeight={isCategoryLabel ? 'medium' : 'normal'}
        color={isCategoryLabel ? 'grey.100' : 'black.100'}
      >
        {categoryLabel}
      </Text>
    </Flex>
  );
};

type FilterCategoryProps = {
  filter: {
    label: string;
    id: string;
  };
  isCategoryLabel?: boolean;
  filterLabel: string;
  selected: boolean;
  setCurrentFilter: Function;
  selectedFilters: Filters;
  currentFilter: FilterTypes;
  isFilterEnabled: boolean;
};

export const FilterCategory = ({
  filter,
  isCategoryLabel = false,
  selected = false,
  filterLabel,
  setCurrentFilter,
  isFilterEnabled,
}: FilterCategoryProps) => {
  return (
    <Box
      w={'full'}
      onClick={() => setCurrentFilter?.(filter.id)}
      cursor={'pointer'}
      bg={selected ? 'white.200' : ''}
      rounded={'lg'}
      minWidth={'50'}
    >
      <Flex
        justifyContent={'space-between'}
        alignItems={'center'}
        paddingY={'2.5'}
        paddingRight={2}
        paddingLeft={3}
        height={{ base: '8', md: '9' }}
        width={'full'}
      >
        <Text
          fontSize={{ base: 'xs-12', md: 'xs-14' }}
          lineHeight={{ base: 'xs-12', md: 'xs-14' }}
          fontWeight={isCategoryLabel ? 'medium' : 'normal'}
          color={isCategoryLabel ? 'grey.100' : 'black.100'}
        >
          {filterLabel}
        </Text>
        <Box fontSize={'sh-28'}>{isFilterEnabled && '•'}</Box>
      </Flex>
    </Box>
  );
};

type FilterCategoriesProps = {
  filters: Array<{
    label: string;
    id: string;
    isCategory: boolean;
    subSections: Array<FilterOption>;
  }>;
  setCurrentFilter: Function;
  currentFilter: FilterTypes;
  selectedFilters: Filters;
};

const FilterCategories = ({
  filters,
  setCurrentFilter,
  currentFilter,
  selectedFilters,
}: FilterCategoriesProps) => {
  return (
    <Flex
      direction={'column'}
      gap={{ base: '2', md: '3' }}
      px={{ base: '2', md: '4' }}
      py={{ base: '2', md: '3' }}
      width={'full'}
      borderRight={'1px'}
      borderColor={'white.200'}
      overflowY={'auto'}
    >
      <FilterCategoryHeader categoryLabel="Frequently Used" />
      {filters.map((filter) => {
        const { label, id, isCategory, subSections } = filter;
        return (
          <Fragment key={id}>
            <Divider
              width={'full'}
              orientation="horizontal"
              borderColor={'white.200'}
              opacity={1}
            />
            <FilterCategoryHeader
              isCategoryLabel={isCategory}
              categoryLabel={label}
            />
            {subSections.map((subSection) => {
              return (
                <FilterCategory
                  selected={subSection.id === currentFilter}
                  filter={subSection}
                  key={subSection.id}
                  filterLabel={subSection.label}
                  setCurrentFilter={setCurrentFilter}
                  selectedFilters={selectedFilters}
                  currentFilter={currentFilter}
                  isFilterEnabled={!!selectedFilters[subSection.id].length}
                />
              );
            })}
          </Fragment>
        );
      })}
    </Flex>
  );
};

export default FilterCategories;
