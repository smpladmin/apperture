import { Box, Button, Flex, Text } from '@chakra-ui/react';
import LoadingSpinner from '@components/LoadingSpinner';
import { Metric } from '@lib/domain/metric';
import { Provider } from '@lib/domain/provider';
import { SavedItems, WatchListItemType } from '@lib/domain/watchlist';
import { getSavedMetricsForUser } from '@lib/services/metricService';
import { Row } from '@tanstack/react-table';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import WatchlistTable from '../Table';

const SavedMetrics = ({ provider }: { provider: Provider }) => {
  const [funnels, setFunnels] = useState<SavedItems[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const { dsId } = router.query;

  useEffect(() => {
    const getMetrics = async () => {
      let savedMetrics = (await getSavedMetricsForUser()) || [];
      savedMetrics = savedMetrics.map((metric: Metric) => {
        return { type: WatchListItemType.METRICS, details: metric };
      });
      setFunnels(savedMetrics);
      setIsLoading(false);
    };

    setIsLoading(true);
    getMetrics();
  }, []);

  const onRowClick = (row: Row<SavedItems>) => {
    const { _id, datasourceId } = row?.original?.details;
    router.push({
      pathname: `/analytics/metric/view/[id]`,
      query: { id: _id, dsId: datasourceId },
    });
  };

  const handleRedirectToCreateMetric = () => {
    router.push({
      pathname: '/analytics/metric/create/[dsId]',
      query: { dsId },
    });
  };

  return (
    <Box px={{ base: '4', md: '30' }} py={'13'} overflowY={'auto'}>
      <Flex justifyContent={'space-between'}>
        <Text fontSize={'sh-24'} lineHeight={'sh-24'} fontWeight={'600'}>
          Metrics
        </Text>
        <Button
          disabled={provider === Provider.GOOGLE}
          variant={'primary'}
          bg={'black.100'}
          px={'6'}
          py={'4'}
          onClick={handleRedirectToCreateMetric}
        >
          <Text
            color={'white.DEFAULT'}
            fontSize={'xs-14'}
            lineHeight={'xs-14'}
            fontWeight={'500'}
          >
            {'+ New Metric'}
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
          <WatchlistTable savedItemsData={funnels} onRowClick={onRowClick} />
        )}
      </Box>
    </Box>
  );
};

export default SavedMetrics;
