import { Box, Button, Flex, Text } from '@chakra-ui/react';
import { SegmentGroup } from '@lib/domain/segment';
import React, { useState } from 'react';
import QueryBuilder from './components/QueryBuilder';

const CreateSegment = () => {
  const [groups, setGroups] = useState<SegmentGroup[]>([]);
  return (
    <Box>
      <Flex
        alignItems={'center'}
        justifyContent={'space-between'}
        bg={'black.50'}
        py={'2'}
        px={'4'}
      >
        <Flex alignItems={'center'} gap={'1'}>
          <Box color={'white.DEFAULT'} cursor={'pointer'}>
            <i className="ri-arrow-left-line"></i>
          </Box>
          <Text
            fontSize={'sh-20'}
            lineHeight={'sh-20'}
            fontWeight={'600'}
            color={'white.DEFAULT'}
          >
            New Segment
          </Text>
        </Flex>
        <Button
          px={'6'}
          py={'2'}
          fontSize={'base'}
          lineHeight={'base'}
          fontWeight={'600'}
          bg={'white.DEFAULT'}
        >
          Save Segment
        </Button>
      </Flex>
      <Box py={'7'} px={'10'}>
        <Flex justifyContent={'space-between'} alignItems={'center'}>
          <Text fontSize={'sh-18'} lineHeight={'sh-18'} fontWeight={'500'}>
            Segment Builder
          </Text>
          <Text fontSize={'xs-14'} lineHeight={'xs-14'} fontWeight={'500'}>
            Clear all
          </Text>
        </Flex>
        <QueryBuilder />
      </Box>
    </Box>
  );
};

export default CreateSegment;
