import { Box, Divider, Flex, Text } from '@chakra-ui/react';
import MetricViewComponentCard from './MetricViewComponentCard';
import { MetricAggregate } from '@lib/domain/metric';
import Card from '@components/Card';
import { Function } from 'phosphor-react';
import { Fragment } from 'react';

const ViewMetricActionPanel = ({
  metricDefinition,
  aggregates,
  breakdown,
}: {
  metricDefinition: string;
  aggregates: MetricAggregate[];
  breakdown: string[];
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
            <Card borderRadius={'8'}>
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
            Events / Segments
          </Text>
          <Card p={'0'} borderRadius={'8px'}>
            <Flex direction={'column'}>
              {aggregates.map((aggregate, index) => {
                const lastAggegate = index === aggregates.length - 1;
                return (
                  <Fragment key={aggregate.variable}>
                    <MetricViewComponentCard
                      definition={metricDefinition}
                      variable={aggregate.variable}
                      reference={aggregate.reference_id}
                      filters={aggregate.filters}
                      aggregation={aggregate.aggregations}
                    />
                    {!lastAggegate && <Divider borderColor={'grey.400'} />}
                  </Fragment>
                );
              })}
            </Flex>
          </Card>
        </Flex>

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
            <Card borderRadius={'8'}>
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
