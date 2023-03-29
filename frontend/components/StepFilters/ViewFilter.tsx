import { Flex, Text } from '@chakra-ui/react';
import { WhereFilter } from '@lib/domain/common';
import { getFilterValuesText } from '@lib/utils/common';
import React from 'react';

type ViewFilterProps = {
  filter: WhereFilter;
};

const ViewFilter = ({ filter }: ViewFilterProps) => {
  return (
    <Flex gap={'1'}>
      <Flex w={'full'} paddingLeft={'6'} direction={'column'} flexWrap={'wrap'}>
        <Flex
          gap={'1'}
          alignItems={'center'}
          direction={'row'}
          fontSize={'xs-12'}
          lineHeight={'lh-135'}
          color={'grey.500'}
          flexWrap={'wrap'}
          justifyContent={'flex-start'}
        >
          <Text
            maxWidth={'full'}
            flexShrink={0}
            fontSize={'inherit'}
            lineHeight={'inherit'}
            color={'inherit'}
            wordBreak={'break-all'}
          >{`${filter.condition} `}</Text>
          <Text
            maxWidth={'full'}
            flexShrink={0}
            fontSize={'inherit'}
            lineHeight={'inherit'}
            color={'inherit'}
            wordBreak={'break-all'}
          >{`${filter.operand}`}</Text>
          <Text
            maxWidth={'full'}
            flexShrink={0}
            fontSize={'inherit'}
            lineHeight={'inherit'}
            color={'inherit'}
            wordBreak={'break-all'}
          >{`${filter.operator}`}</Text>
          <Text
            maxWidth={'full'}
            flexShrink={0}
            fontSize={'inherit'}
            lineHeight={'inherit'}
            color={'inherit'}
            wordBreak={'break-all'}
          >{`${getFilterValuesText(filter.values)}`}</Text>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default ViewFilter;
