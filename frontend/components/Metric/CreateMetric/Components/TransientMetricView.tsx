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
  metric: ComputedMetric | null;
  setDateRange: Function;
  dateRange: DateRangeType | null;
  isLoading: boolean;
  eventProperties: string[];
  loadingEventsAndProperties: boolean;
  breakdown: string[];
  setBreakdown: Function;
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
      height={'full'}
      justifyContent={'center'}
      alignItems={'center'}
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
                  variant={'outline'}
                  height={8}
                  onClick={() => setIsPropertiesListOpen(true)}
                >
                  <Flex gap={'2'} color={'grey.200'}>
                    <i
                      style={{ fontSize: '12px' }}
                      className="ri-pie-chart-line"
                    />
                    <Text
                      fontSize={'xs-12'}
                      fontWeight={400}
                      color={'grey.200'}
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
          {metric && metric.data.length > 0 ? (
            <MetricTrend
              data={metric.data}
              definition={metric.definition}
              average={metric.average}
            />
          ) : (
            <MetricEmptyState />
          )}
        </>
      )}
    </Flex>
  );
};

export default TransientMetricView;
