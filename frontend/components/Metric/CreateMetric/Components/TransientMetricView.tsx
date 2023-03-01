import { Box, Button, Flex, Highlight, Text } from '@chakra-ui/react';
import React, { useRef, useState } from 'react';
import MetricEmptyState from './MetricEmptyState';
import DateFilter from './DateFilter';
import { DateRangeType, ComputedMetric } from '@lib/domain/metric';
import MetricTrend from './MetricTrend';
import Loader from '@components/LoadingSpinner';
import SearchableListDropdown from '@components/SearchableDropdown/SearchableListDropdown';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';

type TransientMetricViewProps = {
  metric: ComputedMetric[];
  setDateRange: Function;
  dateRange: DateRangeType | null;
  isLoading: boolean;
  eventProperties: string[];
  loadingEventsAndProperties: boolean;
  breakdown: string[];
  setBreakdown: Function;
  showEmptyState: boolean;
};

const TransientMetricView = ({
  metric,
  setDateRange,
  dateRange,
  isLoading,
  eventProperties,
  loadingEventsAndProperties,
  breakdown,
  setBreakdown,
  showEmptyState,
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
      py={{ base: '8', md: '10' }}
      width={'full'}
      minHeight={'full'}
      justifyContent={'center'}
      alignItems={'center'}
      overflowY={'scroll'}
    >
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <Flex w="full" justifyContent={'space-between'}>
            <DateFilter setDateRange={setDateRange} dateRange={dateRange} />

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
                    <i
                      style={{ fontSize: '12px' }}
                      className="ri-pie-chart-line"
                    />
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
                        <i
                          className="ri-close-line"
                          style={{ fontSize: '12px' }}
                        />
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
          ) : (
            <MetricTrend data={metric} breakdown={breakdown} />
          )}
        </>
      )}
    </Flex>
  );
};

export default TransientMetricView;
