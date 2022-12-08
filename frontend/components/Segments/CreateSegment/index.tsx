import React, { useState, useEffect } from 'react';
import { Box, Button, Flex, Text } from '@chakra-ui/react';
import { SegmentGroup } from '@lib/domain/segment';
import QueryBuilder from './components/QueryBuilder';
import SegmentTable from './components/Table/SegmentTable';
import { getEventProperties } from '@lib/services/datasourceService';
import { useRouter } from 'next/router';

const CreateSegment = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const [eventProperties, setEventProperties] = useState([]);
  const [loadingEventProperties, setLoadingEventProperties] = useState(false);

  const router = useRouter();
  const { dsId } = router.query;

  useEffect(() => {
    if (!loadingEventProperties) {
      console.log(eventProperties);
    }
  }, [loadingEventProperties]);

  useEffect(() => {
    const fetchEventProperties = async () => {
      const data = await getEventProperties(dsId as string);
      setEventProperties(data);
      setLoadingEventProperties(false);
    };
    setLoadingEventProperties(true);
    fetchEventProperties();
  }, []);

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
          <Text
            fontSize={'sh-18'}
            lineHeight={'sh-18'}
            fontWeight={'500'}
            data-testid={'segment-builder'}
          >
            Segment Builder
          </Text>
          <Text
            fontSize={'xs-14'}
            lineHeight={'xs-14'}
            fontWeight={'500'}
            data-testid={'clear-all'}
          >
            Clear all
          </Text>
        </Flex>
        <QueryBuilder
          eventProperties={eventProperties}
          loadingEventProperties={loadingEventProperties}
        />
        <SegmentTable eventProperties={eventProperties} />
      </Box>
    </Box>
  );
};

export default CreateSegment;
