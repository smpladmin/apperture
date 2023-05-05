import { Flex, Text } from '@chakra-ui/react';
import Card from '@components/Card';
import React from 'react';
import GranularityCriteria from '@components/Retention/components/GranularityCriteria';
import SelectEventsRetention from '@components/Retention/components/SelectEventsRetention';
import { Granularity, RetentionEvents } from '@lib/domain/retention';
import SegmentFilter from '@components/Metric/components/SegmentFilter';
import { ExternalSegmentFilter } from '@lib/domain/common';
import { Node } from '@lib/domain/node';

type CreateRetentionActionProps = {
  retentionEvents: RetentionEvents;
  setRetentionEvents: Function;
  granularity: Granularity;
  setGranularity: Function;
  segmentFilters: ExternalSegmentFilter[];
  updateSegmentFilter: Function;
  loadingEventsAndProperties: boolean;
  eventProperties: string[];
  eventList: Node[];
};

export const CreateRetentionAction = ({
  retentionEvents,
  setRetentionEvents,
  granularity,
  setGranularity,
  segmentFilters,
  updateSegmentFilter,
  eventProperties,
  loadingEventsAndProperties,
  eventList,
}: CreateRetentionActionProps) => {
  return (
    <Flex direction={'column'} gap={'3'} w={'full'}>
      <Flex px={2} justifyContent={'space-between'} alignItems={'center'}>
        <Flex gap={2} alignItems={'center'}>
          <Text
            color={'grey.500'}
            fontSize={{ base: 'xs-10', md: 'xs-12' }}
            lineHeight={{ base: 'xs-10', md: 'xs-12' }}
            fontWeight={'400'}
          >
            Retention
          </Text>
        </Flex>
      </Flex>
      {Object.entries(retentionEvents).map((retentionEvent, index) => {
        const [eventKey, event] = retentionEvent;
        return (
          <SelectEventsRetention
            key={eventKey}
            index={index}
            retentionEvent={event}
            eventKey={eventKey as keyof RetentionEvents}
            retentionEvents={retentionEvents}
            setRetentionEvents={setRetentionEvents}
          />
        );
      })}
      <Flex
        px={2}
        justifyContent={'space-between'}
        alignItems={'center'}
        mt={3}
      >
        <Flex gap={2} alignItems={'center'}>
          <Text
            color={'grey.500'}
            fontSize={{ base: 'xs-10', md: 'xs-12' }}
            lineHeight={{ base: 'xs-10', md: 'xs-12' }}
            fontWeight={'400'}
          >
            Granularity
          </Text>
        </Flex>
      </Flex>
      <Card padding={3}>
        <GranularityCriteria
          granularity={granularity}
          setGranularity={setGranularity}
        />
      </Card>
      {segmentFilters.map((segmentFilter, index) => (
        <SegmentFilter
          key={index}
          index={index}
          segmentFilter={segmentFilter}
          updateSegmentFilter={updateSegmentFilter}
          segmentFilters={segmentFilters}
          eventProperties={eventProperties}
          loadingEventProperties={loadingEventsAndProperties}
        />
      ))}
    </Flex>
  );
};
