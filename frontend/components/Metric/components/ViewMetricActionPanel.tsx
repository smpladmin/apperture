import { Box, Divider, Flex, Text } from '@chakra-ui/react';
import MetricViewComponentCard from './MetricViewComponentCard';
import { MetricAggregate, MetricSegmentFilter } from '@lib/domain/metric';
import Card from '@components/Card';
import { Function, UsersFour } from 'phosphor-react';
import { Fragment } from 'react';
import ViewFilter from '@components/StepFilters/ViewFilter';
import { WhereSegmentFilter } from '@lib/domain/segment';
import { getSelectedSegmentsText } from '../util';
import { GREY_600 } from '@theme/index';

const ViewMetricActionPanel = ({
  metricDefinition,
  aggregates,
  breakdown,
  segmentFilters,
}: {
  metricDefinition: string;
  aggregates: MetricAggregate[];
  breakdown: string[];
  segmentFilters: MetricSegmentFilter[] | null;
}) => {
  return (
    <Card>
      <Flex direction={'column'} w={'full'} gap={'6'}>
        {!!metricDefinition && (
          <Flex direction={'column'} gap={'3'}>
            <Text
              fontSize={'xs-12'}
              lineHeight={'xs-12'}
              fontWeight={'400'}
              color={'grey.500'}
            >
              Metric Definition
            </Text>
            <Card borderRadius={'8'} borderColor={'white.200'} p={'3'}>
              <Flex alignItems={'center'} gap={'2'}>
                <Box
                  bg={'blue.500'}
                  height={'18px'}
                  width={'18px'}
                  borderRadius={'4'}
                  padding={'2px'}
                >
                  <Function color="white" size={'14'} weight="bold" />
                </Box>
                <Text
                  fontSize={'xs-14'}
                  lineHeight={'xs-14'}
                  fontWeight={'500'}
                  data-testid={'metric-definition'}
                >
                  {metricDefinition}
                </Text>
              </Flex>
            </Card>
          </Flex>
        )}

        <Flex direction={'column'} gap={'3'}>
          <Text
            fontSize={'xs-12'}
            lineHeight={'xs-12'}
            fontWeight={'400'}
            color={'grey.500'}
          >
            {'Events / Segments'}
          </Text>
          <Card p={'0'} borderRadius={'8px'} borderColor={'white.200'}>
            <Flex direction={'column'}>
              {aggregates.map((aggregate, index) => {
                const lastAggegate = index === aggregates.length - 1;
                return (
                  <Fragment key={aggregate.variable}>
                    <MetricViewComponentCard
                      index={index}
                      definition={metricDefinition}
                      variable={aggregate.variable}
                      reference={aggregate.reference_id}
                      filters={aggregate.filters}
                      aggregation={aggregate.aggregations}
                      breakdown={breakdown}
                    />
                    {!lastAggegate && <Divider borderColor={'white.200'} />}
                  </Fragment>
                );
              })}
            </Flex>
          </Card>
        </Flex>

        {segmentFilters &&
          segmentFilters.map((segmentFilter) => {
            const customSegmentFilters = segmentFilter.custom
              .filters as WhereSegmentFilter[];
            return (
              <Flex direction={'column'} gap={'3'}>
                <Text
                  fontSize={'xs-12'}
                  lineHeight={'xs-12'}
                  fontWeight={'400'}
                  color={'grey.500'}
                >
                  Filter
                </Text>
                <Card borderRadius={'8'} borderColor={'white.200'} p={'3'}>
                  <Flex direction={'column'} gap={'1'}>
                    <Flex gap={'2'} alignItems={'center'}>
                      <UsersFour size={20} color={GREY_600} />
                      <Text
                        fontSize={'xs-14'}
                        lineHeight={'xs-14'}
                        fontWeight={'500'}
                      >
                        {getSelectedSegmentsText(
                          segmentFilter.includes,
                          segmentFilter.segments
                        )}
                      </Text>
                    </Flex>
                    {Boolean(customSegmentFilters.length) &&
                      customSegmentFilters.map((filter, index: number) => (
                        <Box px={'1'}>
                          <ViewFilter key={index} filter={filter} />
                        </Box>
                      ))}
                  </Flex>
                </Card>
              </Flex>
            );
          })}

        {!!breakdown?.length && (
          <Flex direction={'column'} gap={'3'}>
            <Text
              fontSize={'xs-12'}
              lineHeight={'xs-12'}
              fontWeight={'400'}
              color={'grey.500'}
            >
              Breakdown
            </Text>
            <Card borderRadius={'8'} borderColor={'white.200'} p={'3'}>
              {
                <Text
                  fontSize={'xs-14'}
                  lineHeight={'xs-14'}
                  fontWeight={'500'}
                >
                  {breakdown.join(' ,')}
                </Text>
              }
            </Card>
          </Flex>
        )}
      </Flex>
    </Card>
  );
};

export default ViewMetricActionPanel;
