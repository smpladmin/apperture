import { Box, Flex, Text } from '@chakra-ui/react';
import { getDisplayAggregationFunctionText } from '@components/Metric/util';
import Dropdown from '@components/SearchableDropdown/Dropdown';
import SearchableListDropdown from '@components/SearchableDropdown/SearchableListDropdown';
import {
  MetricAggregate,
  MetricAggregatePropertiesAggregation,
  MetricBasicAggregation,
} from '@lib/domain/metric';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import { trimLabel } from '@lib/utils/common';
import { GREY_700 } from '@theme/index';
import { ArrowElbowDownRight } from 'phosphor-react';
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

  return (
    <Flex width={'full'} alignItems={'center'} gap={'3'} pl={'1'}>
      <ArrowElbowDownRight size={12} weight="bold" color={GREY_700} />
      <Flex alignItems={'center'} gap={'1'}>
        <Text
          fontSize={'xs-12'}
          lineHeight={'lh-120'}
          fontWeight={'400'}
          color={'grey.600'}
        >
          {'in'}
        </Text>
        <Box position={'relative'} ref={aggregationRef}>
          <Box
            p={'1'}
            _hover={{ color: 'grey.800', background: 'white.400' }}
            borderBottom={'1px dashed'}
            borderColor={'grey.800'}
          >
            <Text
              color={'black.500'}
              fontSize={'xs-12'}
              lineHeight={'lh-120'}
              cursor={'pointer'}
              data-testid={'metric-aggregation-function'}
              onClick={() => setIsAggregationListOpen(true)}
              _hover={{ color: 'grey.800' }}
            >
              {getDisplayAggregationFunctionText(aggregation.functions)}
            </Text>
          </Box>

          <Dropdown isOpen={isAggregationListOpen} width={'76'}>
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
                  borderRadius={'4'}
                >
                  <Text
                    fontWeight={500}
                    fontSize={'xs-14'}
                    lineHeight={'lh-130'}
                    color={'black.500'}
                  >
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
            <Box p={'1'}>
              <Text
                fontSize={'xs-12'}
                lineHeight={'lh-120'}
                fontWeight={'400'}
                color={'grey.600'}
              >
                {'of'}
              </Text>
            </Box>

            <Box position={'relative'} ref={selectFilterRef}>
              <Box
                p={'1'}
                _hover={{ color: 'grey.800', background: 'white.400' }}
                borderBottom={'dashed'}
                borderColor={'grey.800'}
              >
                <Text
                  color={'black.500'}
                  fontSize={'xs-12'}
                  lineHeight={'lh-120'}
                  fontWeight={'400'}
                  _hover={{ color: 'grey.800', background: 'white.400' }}
                  cursor={'pointer'}
                  onClick={() => setIsPropertiesListOpen(true)}
                  data-testid={'metric-aggregation-event-property'}
                  wordBreak={'break-word'}
                >
                  {trimLabel(aggregation.property, 25) || 'Select Property'}
                </Text>
              </Box>

              <SearchableListDropdown
                isOpen={isPropertiesListOpen}
                data={eventProperties}
                isLoading={loadingEventsAndProperties}
                onSubmit={onSuggestionClick}
                width={'96'}
              />
            </Box>
          </>
        ) : null}
      </Flex>
    </Flex>
  );
};

export default MetricAggregation;
