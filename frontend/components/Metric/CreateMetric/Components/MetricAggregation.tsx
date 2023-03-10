import { Box, Flex, Text } from '@chakra-ui/react';
import { metricAggregationDisplayText } from '@components/Metric/util';
import Dropdown from '@components/SearchableDropdown/Dropdown';
import SearchableListDropdown from '@components/SearchableDropdown/SearchableListDropdown';
import {
  MetricAggregate,
  MetricAggregatePropertiesAggregation,
  MetricBasicAggregation,
} from '@lib/domain/metric';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import { ARROW_GRAY, WHITE_100 } from '@theme/index';
import React, { useRef, useState } from 'react';

type MetricAggregationProps = {
  aggregate: MetricAggregate;
  updateAggregate: Function;
  eventProperties: string[];
  loadingEventsAndProperties: boolean;
};

const MetricAggregation = ({
  aggregate,
  updateAggregate,
  eventProperties,
  loadingEventsAndProperties,
}: MetricAggregationProps) => {
  const aggregation = aggregate.aggregations;

  const [isAggregationListOpen, setIsAggregationListOpen] =
    useState<boolean>(false);

  const [isPropertiesListOpen, setIsPropertiesListOpen] = useState<boolean>(
    aggregation.property ? false : true
  );

  const metricAggregations = [
    ...Object.values(MetricBasicAggregation),
    ...Object.values(MetricAggregatePropertiesAggregation),
  ];

  const aggregationRef = useRef(null);

  useOnClickOutside(aggregationRef, () => setIsAggregationListOpen(false));

  const handleUpdateAggregationFunction = (aggregationFunction: string) => {
    setIsAggregationListOpen(false);

    const aggregationObj = {
      functions: aggregationFunction,
      property: '',
    };
    updateAggregate(aggregate.variable, {
      aggregations: aggregationObj,
    });
  };

  const selectFilterRef = useRef(null);

  useOnClickOutside(selectFilterRef, () => setIsPropertiesListOpen(false));

  const onSuggestionClick = (aggregationProperty: string) => {
    setIsPropertiesListOpen(false);
    const aggregationObj = {
      ...aggregation,
      property: aggregationProperty,
    };
    updateAggregate(aggregate.variable, {
      aggregations: aggregationObj,
    });
  };

  const getDisplayAggregationFunctionText = (value: string) => {
    return metricAggregationDisplayText[value];
  };

  return (
    <Flex width={'full'} alignItems={'center'}>
      <Box position={'relative'} ref={aggregationRef}>
        <Text
          color={'white'}
          fontSize={'xs-12'}
          lineHeight={'xs-16'}
          marginLeft={4}
          cursor={'pointer'}
          px={'2'}
          py={'1'}
          borderRadius={4}
          _hover={{ color: 'white', background: 'grey.300' }}
          data-testid={'metric-aggregation-function'}
          onClick={() => setIsAggregationListOpen(true)}
        >
          {getDisplayAggregationFunctionText(aggregation.functions)}
        </Text>

        <Dropdown isOpen={isAggregationListOpen} minWidth={'40'}>
          {metricAggregations.map((aggregation) => {
            return (
              <Box
                px={'2'}
                py={'3'}
                cursor={'pointer'}
                _hover={{ background: 'white.100' }}
                key={aggregation}
                onClick={() => {
                  handleUpdateAggregationFunction(aggregation);
                }}
                data-testid={'metric-aggregation-options'}
              >
                <Text fontWeight={500} fontSize={'xs-14'} lineHeight={'xs-14'}>
                  {getDisplayAggregationFunctionText(aggregation)}
                </Text>
              </Box>
            );
          })}
        </Dropdown>
      </Box>
      {Object.values(MetricAggregatePropertiesAggregation).includes(
        aggregation.functions as any
      ) ? (
        <>
          <Box>
            <Text
              fontSize={'xs-12'}
              lineHeight={'xs-16'}
              fontWeight={'400'}
              color={ARROW_GRAY}
              cursor={'pointer'}
              px={'2'}
              py={'1'}
            >
              {'of'}
            </Text>
          </Box>

          <Box
            position={'relative'}
            ref={selectFilterRef}
            borderColor={'grey.100'}
          >
            <Text
              fontSize={'xs-12'}
              lineHeight={'xs-16'}
              fontWeight={'400'}
              px={'2'}
              py={'1'}
              color={WHITE_100}
              _hover={{ color: 'white', background: 'grey.300' }}
              cursor={'pointer'}
              onClick={() => setIsPropertiesListOpen(true)}
              data-testid={'metric-aggregation-event-property'}
              wordBreak={'break-word'}
            >
              {aggregation.property || 'Select Property'}
            </Text>

            <SearchableListDropdown
              isOpen={isPropertiesListOpen}
              data={eventProperties}
              isLoading={loadingEventsAndProperties}
              onSubmit={onSuggestionClick}
            />
          </Box>
        </>
      ) : null}
    </Flex>
  );
};

export default MetricAggregation;
