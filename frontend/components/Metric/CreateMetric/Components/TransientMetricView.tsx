import { Box, Button, Flex, Highlight, Text } from '@chakra-ui/react';
import React, { useRef, useState } from 'react';
import MetricEmptyState from './MetricEmptyState';
import DateFilterComponent from '@components/Date/DateFilter';
import { ComputedMetric } from '@lib/domain/metric';
import MetricTrend from './MetricTrend';
import Loader from '@components/LoadingSpinner';
import SearchableListDropdown from '@components/SearchableDropdown/SearchableListDropdown';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import { DateFilterObj } from '@lib/domain/common';

type TransientMetricViewProps = {
  metric: ComputedMetric[];
  isLoading: boolean;
  eventProperties: string[];
  loadingEventsAndProperties: boolean;
  breakdown: string[];
  setBreakdown: Function;
  showEmptyState: boolean;
  dateFilter: DateFilterObj;
  setDateFilter: Function;
};

const TransientMetricView = ({
  metric,
  isLoading,
  eventProperties,
  loadingEventsAndProperties,
  breakdown,
  setBreakdown,
  showEmptyState,
  dateFilter,
  setDateFilter,
}: TransientMetricViewProps) => {
  const breakdownRef = useRef(null);
  const [isPropertiesListOpen, setIsPropertiesListOpen] = useState(false);

  useOnClickOutside(breakdownRef, () => setIsPropertiesListOpen(false));

  const handlePropertySelected = (value: string) => {
    setIsPropertiesListOpen(false);
    setBreakdown([value]);
  };

  return (
    <Flex
      direction={'column'}
      py={{ base: '8', md: '12' }}
      width={'full'}
      minHeight={'full'}
      overflowY={'scroll'}
    >
      <Flex w="full" justifyContent={'space-between'}>
        <DateFilterComponent
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
        />

        <Flex gap={'1'}>
          <Button
            _focus={{ bg: 'grey.50', color: 'black', fontWeight: 500 }}
            border="1px solid #EDEDED"
            id="yesterday"
            color={'grey.200'}
            fontWeight={400}
            variant={'outline'}
            height={8}
            fontSize={'xs-12'}
          >
            <i
              style={{
                marginRight: '10px',
                transform: 'rotate(90deg)',
              }}
              className="ri-sound-module-line"
            ></i>
            Filters
          </Button>
          <Box position={'relative'} ref={breakdownRef}>
            <Button
              _focus={{ bg: 'grey.50', color: 'black', fontWeight: 500 }}
              border="1px solid #EDEDED"
              id="yesterday"
              variant={'secondary'}
              height={8}
              onClick={() => setIsPropertiesListOpen(true)}
              data-testid={'select-breakdown'}
            >
              <Flex gap={'2'} color={'grey.200'} alignItems={'center'}>
                <i style={{ fontSize: '12px' }} className="ri-pie-chart-line" />
                <Text
                  fontSize={'xs-12'}
                  fontWeight={400}
                  color={'grey.200'}
                  data-testid={'breakdown-name'}
                >
                  <Highlight
                    query={`${breakdown}`}
                    styles={{
                      fontSize: 'xs-12',
                      fontWeight: 500,
                      color: 'black.100',
                    }}
                  >
                    {`Breakdown ${breakdown.join('')}`}
                  </Highlight>
                </Text>
                {!!breakdown.length && (
                  <Box
                    onClick={(e) => {
                      e.stopPropagation();
                      setBreakdown([]);
                    }}
                    data-testid={'remove-breakdown'}
                  >
                    <i className="ri-close-line" style={{ fontSize: '12px' }} />
                  </Box>
                )}
              </Flex>
            </Button>
            <SearchableListDropdown
              isOpen={isPropertiesListOpen}
              isLoading={loadingEventsAndProperties}
              data={eventProperties}
              onSubmit={handlePropertySelected}
              dropdownPosition={'right'}
            />
          </Box>
        </Flex>
      </Flex>
      {showEmptyState ? (
        <MetricEmptyState />
      ) : isLoading ? (
        <Flex alignItems={'center'} justifyContent={'center'} height={'120'}>
          <Loader />
        </Flex>
      ) : (
        <MetricTrend data={metric} breakdown={breakdown} />
      )}
    </Flex>
  );
};

export default TransientMetricView;
