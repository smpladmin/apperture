import { Box, Text } from '@chakra-ui/react';
import { SegmentFilter } from '@lib/domain/segment';

const FilterOperator = ({ filter }: { filter: SegmentFilter }) => {
  return (
    <Box>
      <Text
        fontSize={'xs-14'}
        lineHeight={'xs-14'}
        fontWeight={'600'}
        px={'2'}
        py={'2'}
        bg={'white.100'}
        cursor={'pointer'}
      >
        {filter.operator}
      </Text>
    </Box>
  );
};

export default FilterOperator;
