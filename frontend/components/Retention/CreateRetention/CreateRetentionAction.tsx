import { Flex, Text } from '@chakra-ui/react';
import Card from '@components/Card';
import React from 'react';
import GranularityCriteria from '@components/Retention/components/GranularityCriteria';
import SelectEventsRetention from '../components/SelectEventsRetention';
import { Granularity, RetentionEvents } from '@lib/domain/retention';
import { Plus } from 'phosphor-react';

type CreateRetentionActionProps = {
  retentionEvents: RetentionEvents;
  setRetentionEvents: Function;
  granularity: Granularity;
  setGranularity: Function;
};

export const CreateRetentionAction = ({
  retentionEvents,
  setRetentionEvents,
  granularity,
  setGranularity,
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
      <Flex paddingX={2} pt={'6'} justifyContent={'space-between'}>
        <Text
          color={'grey.500'}
          fontSize={{ base: 'xs-10', md: 'xs-12' }}
          lineHeight={{ base: 'xs-10', md: 'xs-12' }}
          fontWeight={'400'}
        >
          Filter
        </Text>
        <Flex alignItems={'center'} justifyContent={'center'}>
          <Plus width={'14'} />
        </Flex>
      </Flex>
    </Flex>
  );
};
