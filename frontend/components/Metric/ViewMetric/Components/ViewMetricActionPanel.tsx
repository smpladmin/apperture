import { Button, Divider, Flex, IconButton, Text } from '@chakra-ui/react';
import React from 'react';

import { BASTILLE } from '@theme/index';

import MetricViewComponentCard from './MetricViewComponentCard';
import ActionMenu from '@components/ActionMenu';
import { EventOrSegmentComponent } from '@lib/domain/metric';
import { useRouter } from 'next/router';

const ViewMetricActionPanel = ({
  metricName,
  metricDefinition,
  aggregates,
}: {
  metricName: string;
  metricDefinition: string;
  aggregates: EventOrSegmentComponent[];
}) => {
  const router = useRouter();
  return (
    <>
      <Flex justifyContent={'space-between'} alignItems={'center'}>
        <IconButton
          aria-label="close"
          variant={'secondary'}
          icon={<i className="ri-arrow-left-line"></i>}
          rounded={'full'}
          color={'white.DEFAULT'}
          bg={'black.20'}
          onClick={() => {
            router.push({
              pathname: '/analytics/saved',
            });
          }}
        />
        <Button
          borderRadius={'50'}
          bg={'black.300'}
          borderColor={'grey.300'}
          borderWidth={'1px'}
          color={'white'}
          variant={'primary'}
          data-testid={'edit-funnel'}
          onClick={() =>
            router.push({
              pathname: '/analytics/metric/edit/[id]',
              query: { id: router.query.metricId, dsId: router.query.dsId },
            })
          }
        >
          <Flex alignItems={'center'} gap={'1'}>
            <i className="ri-edit-fill"></i>
            <Text
              fontSize={'xs-14'}
              lineHeight={'xs-14'}
              fontWeight={'medium'}
              color={'white'}
            >
              Edit
            </Text>
          </Flex>
        </Button>
      </Flex>

      <Flex direction={'column'} mt={'8'}>
        <Text
          fontSize={{ base: 'sh-20', md: 'sh-32' }}
          lineHeight={{ base: 'sh-20', md: 'sh-32' }}
          fontWeight={'semibold'}
          textColor={'white.DEFAULT'}
          borderColor={'grey.10'}
          px={0}
          data-testid={'metric-name'}
        >
          {metricName}
        </Text>
        <Text
          fontSize={{ base: 'sh-8', md: 'sh-8' }}
          lineHeight={{ base: 'sh-8', md: 'sh-8' }}
          fontWeight={'semibold'}
          textColor={'white.DEFAULT'}
          borderColor={'grey.10'}
          px={0}
          py={2}
          data-testid={'metric-name'}
        >
          {metricDefinition}
        </Text>
      </Flex>

      <Flex direction={'column'} gap={3} mt={{ base: '2', md: '4' }}>
        <Flex justifyContent={'space-between'} alignItems={'center'}>
          <Text fontSize={'xs-12'} color={'grey.200'}>
            EVENTS & SEGMENT
          </Text>
        </Flex>
        {/* <Divider orientation="horizontal" borderColor={BASTILLE} opacity={1} /> */}

        {aggregates.map((aggregate) => (
          <MetricViewComponentCard
            variable={aggregate.variable}
            key={aggregate.variable}
            reference={aggregate.reference_id}
            filters={aggregate.filters}
            conditions={aggregate.conditions}
          />
        ))}
        <ActionMenu />
        <Divider
          mt={'4'}
          orientation="horizontal"
          borderColor={BASTILLE}
          opacity={1}
        />
      </Flex>
    </>
  );
};

export default ViewMetricActionPanel;
