import { Box, Divider, Flex, IconButton, Text } from '@chakra-ui/react';
import { Fragment } from 'react';

type FilterProps = {
  isCategoryLabel?: boolean;
  filterLabel: string;
  selected?: boolean;
};

type FiltersProp = {
  filters: Array<{
    label: string;
    id: string;
    isCategory: boolean;
    subSections: Array<{
      label: string;
      id: string;
    }>;
  }>;
};

export const Filter = ({
  isCategoryLabel = false,
  selected = false,
  filterLabel,
}: FilterProps) => {
  return (
    <Box width={{ base: '32', md: '50' }} height={{ base: '8', md: '9' }}>
      <Flex>
        <Text
          pl={'3'}
          pt={'2'}
          fontSize={'xs-14'}
          fontWeight={isCategoryLabel ? 'medium' : 'normal'}
          color={isCategoryLabel ? 'grey.100' : 'black.100'}
        >
          {filterLabel}
        </Text>
        {selected ?? '*'}
      </Flex>
    </Box>
  );
};

const Filters = ({ filters }: FiltersProp) => {
  return (
    <Flex
      direction={'column'}
      gap={{ base: '2', md: '3' }}
      px={'4'}
      py={'3'}
      width={{ base: '36', md: '62' }}
      borderRight={'1px'}
      borderColor={'white.200'}
    >
      <Filter filterLabel="Frequently Used" />
      {filters.map((filter, i) => {
        return (
          <Fragment key={filter.id}>
            <Divider
              orientation="horizontal"
              borderColor={'white.200'}
              opacity={1}
            />
            <Filter
              filterLabel={filter.label}
              isCategoryLabel={!!filter.isCategory}
            />
          </Fragment>
        );
      })}
    </Flex>
  );
};

export default Filters;
