import { Box, Flex, RadioGroup, Text } from '@chakra-ui/react';
import { SavedItems, WatchListItemType } from '@lib/domain/watchlist';
import React, { useEffect, useState } from 'react';
import WatchListTable from './Table';
import LoadingSpinner from '@components/LoadingSpinner';
import { getSavedFunnelsForUser } from '@lib/services/funnelService';
import { WatchListItemOptions } from './util';
import WatchListItemTypeOptions from './WatchListItemOptions';
import { getSavedSegmentsForUser } from '@lib/services/segmentService';
import { getSavedMetricsForUser } from '@lib/services/metricService';
import { Funnel } from '@lib/domain/funnel';
import { Segment } from '@lib/domain/segment';
import { Metric } from '@lib/domain/metric';

const Watchlist = () => {
  const [selectedItem, setSelectedItem] = useState(WatchListItemType.ALL);
  const [savedItemsData, setSavedItemsData] = useState<SavedItems[]>([]);
  const [metrics, setMetrics] = useState<SavedItems[]>([]);
  const [segments, setSegments] = useState<SavedItems[]>([]);
  const [funnels, setFunnels] = useState<SavedItems[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getFunnels = async () => {
    const savedFunnels = await getSavedFunnelsForUser();
    return savedFunnels.map((funnel: Funnel) => {
      return { type: WatchListItemType.FUNNELS, details: funnel };
    });
  };

  const getSegments = async () => {
    const savedSegments = (await getSavedSegmentsForUser()) || [];
    return savedSegments.map((segment: Segment) => {
      return { type: WatchListItemType.SEGMENTS, details: segment };
    });
  };

  const getMetrics = async () => {
    const savedMetrics = (await getSavedMetricsForUser()) || [];
    return savedMetrics.map((metric: Metric) => {
      return { type: WatchListItemType.METRICS, details: metric };
    });
  };

  const getSavedItems = async () => {
    const [savedMetrics, savedFunnels, savedSegments] = await Promise.all([
      getMetrics(),
      getFunnels(),
      getSegments(),
    ]);
    setMetrics(savedMetrics);
    setFunnels(savedFunnels);
    setSegments(savedSegments);
    setSavedItemsData([...savedMetrics, ...savedFunnels, ...savedSegments]);
    setIsLoading(false);
  };

  useEffect(() => {
    setIsLoading(true);
    getSavedItems();
  }, []);

  useEffect(() => {
    if (selectedItem === WatchListItemType.ALL) {
      setSavedItemsData([...metrics, ...funnels, ...segments]);
    }
    if (selectedItem === WatchListItemType.METRICS) {
      setSavedItemsData([...metrics]);
    }
    if (selectedItem === WatchListItemType.FUNNELS) {
      setSavedItemsData([...funnels]);
    }
    if (selectedItem === WatchListItemType.SEGMENTS) {
      setSavedItemsData([...segments]);
    }
  }, [selectedItem]);

  return (
    <Box px={{ base: '4', md: '30' }} py={'9'} overflowY={'auto'}>
      <Flex justifyContent={'space-between'}>
        <Text fontSize={'sh-20'} lineHeight={'sh-20'} fontWeight={'600'}>
          Saved
        </Text>
      </Flex>

      <Flex justifyContent={'flex-start'} mt={'6'}>
        <RadioGroup
          value={selectedItem}
          onChange={(value: WatchListItemType) => {
            setSelectedItem(value);
          }}
        >
          <Flex gap={'3'} direction={'row'}>
            {WatchListItemOptions.map((watchListItem) => {
              return (
                <WatchListItemTypeOptions
                  key={watchListItem.id}
                  watchListItem={watchListItem}
                  isSelected={watchListItem.id === selectedItem}
                />
              );
            })}
          </Flex>
        </RadioGroup>
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
          <WatchListTable savedItemsData={savedItemsData} />
        )}
      </Box>
    </Box>
  );
};

export default Watchlist;
