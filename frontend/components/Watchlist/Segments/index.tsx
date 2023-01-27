import { Box, Button, Flex, Text } from '@chakra-ui/react';
import LoadingSpinner from '@components/LoadingSpinner';
import { Provider } from '@lib/domain/provider';
import { Segment } from '@lib/domain/segment';
import { SavedItems, WatchListItemType } from '@lib/domain/watchlist';
import { getSavedSegmentsForDatasourceId } from '@lib/services/segmentService';
import { Row } from '@tanstack/react-table';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import WatchlistTable from '../Table';

const SavedSegments = ({ provider }: { provider: Provider }) => {
  const [segments, setSegments] = useState<SavedItems[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const { dsId } = router.query;

  useEffect(() => {
    const getSegments = async () => {
      let savedSegments =
        (await getSavedSegmentsForDatasourceId(dsId as string)) || [];
      savedSegments = savedSegments.map((segment: Segment) => {
        return { type: WatchListItemType.SEGMENTS, details: segment };
      });
      setSegments(savedSegments);
      setIsLoading(false);
    };

    setIsLoading(true);
    getSegments();
  }, []);

  const onRowClick = (row: Row<SavedItems>) => {
    const { _id, datasourceId } = row?.original?.details;
    router.push({
      pathname: `/analytics/segment/edit/[id]`,
      query: { id: _id, dsId: datasourceId },
    });
  };

  const handleRedirectToCreateSegment = () => {
    router.push({
      pathname: '/analytics/segment/create/[dsId]',
      query: { dsId },
    });
  };

  return (
    <Box px={{ base: '4', md: '30' }} py={'13'} overflowY={'auto'}>
      <Flex justifyContent={'space-between'}>
        <Text fontSize={'sh-24'} lineHeight={'sh-24'} fontWeight={'600'}>
          Segments
        </Text>
        <Button
          disabled={provider === Provider.GOOGLE}
          variant={'primary'}
          bg={'black.100'}
          px={'6'}
          py={'4'}
          onClick={handleRedirectToCreateSegment}
        >
          <Text
            color={'white.DEFAULT'}
            fontSize={'xs-14'}
            lineHeight={'xs-14'}
            fontWeight={'500'}
          >
            {'+ New Segment'}
          </Text>
        </Button>
      </Flex>

      <Box mt={'7'}>
        {isLoading ? (
          <Flex
            w={'full'}
            h={'full'}
            minH={'80'}
            justifyContent={'center'}
            alignItems={'center'}
          >
            <LoadingSpinner />
          </Flex>
        ) : (
          <WatchlistTable savedItemsData={segments} onRowClick={onRowClick} />
        )}
      </Box>
    </Box>
  );
};

export default SavedSegments;
