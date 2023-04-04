import { Flex, Radio, RadioGroup, Text } from '@chakra-ui/react';
import { CaptureEventOptions } from '../../utils';
import React from 'react';
import { CaptureEvent } from '@lib/domain/action';

type EventOptionsProps = {
  captureEvent: CaptureEvent;
  updateHandler: Function;
  isDisabled: Boolean;
};

const EventOptions = ({
  captureEvent,
  updateHandler,
  isDisabled,
}: EventOptionsProps) => {
  if (isDisabled) {
    return (
      <Text
        fontSize={{ base: 'xs-12', md: 'xs-14' }}
        lineHeight={{ base: 'xs-16', md: 'xs-18' }}
        fontWeight={'500'}
      >
        {captureEvent == '$autocapture' ? 'Autocapture' : 'Pageview'}
      </Text>
    );
  }
  return (
    <RadioGroup
      value={captureEvent}
      onChange={(value: CaptureEvent) => {
        updateHandler(value, 'event');
      }}
    >
      <Flex
        gap={'2'}
        alignItems={'center'}
        border={'1px'}
        borderColor={'white.200'}
        w={'min-content'}
        p={1}
        borderRadius={'4'}
      >
        {CaptureEventOptions.map((option) => {
          const isSelected = captureEvent === option.value;
          return (
            <Flex
              key={option.value}
              as={'label'}
              borderRadius={'4'}
              bg={isSelected ? 'white.200' : 'white.DEFAULT'}
              px={2}
              py={1}
              data-testid={'watchlistitem'}
              alignItems={'center'}
              gap={'1'}
              cursor={'pointer'}
              borderColor={'white.200'}
              pointerEvents={option.isDisabled ? 'none' : 'all'}
            >
              <Text
                fontSize={{ base: 'xs-12', md: 'xs-14' }}
                lineHeight={{ base: 'xs-16', md: 'xs-18' }}
                fontWeight={'500'}
              >
                {option.label}
              </Text>
              <Radio value={option.value} hidden disabled={option.isDisabled} />
            </Flex>
          );
        })}
      </Flex>
    </RadioGroup>
  );
};

export default EventOptions;
