import { Flex, Radio, RadioGroup, Text } from '@chakra-ui/react';
import { CaptureEventOptions } from '../../utils';
import React from 'react';
import { CaptureEvent } from '@lib/domain/action';

type EventOptionsProps = {
  captureEvent: CaptureEvent;
  setCaptureEvent: Function;
};

const EventOptions = ({ captureEvent, setCaptureEvent }: EventOptionsProps) => {
  return (
    <RadioGroup
      value={captureEvent}
      onChange={(value: CaptureEvent) => {
        setCaptureEvent(value);
      }}
    >
      <Flex gap={'2'} alignItems={'center'}>
        {CaptureEventOptions.map((option) => {
          const isSelected = captureEvent === option.value;
          return (
            <Flex
              key={option.value}
              as={'label'}
              borderRadius={'100'}
              bg={
                isSelected
                  ? 'white.200'
                  : option.isDisabled
                  ? 'grey.100'
                  : 'white.DEFAULT'
              }
              px={'3'}
              py={'2'}
              border={'1px'}
              borderColor={isSelected ? 'black.100' : 'white.200'}
              data-testid={'watchlistitem'}
              alignItems={'center'}
              gap={'1'}
              cursor={'pointer'}
              pointerEvents={option.isDisabled ? 'none' : 'all'}
            >
              <Text
                fontSize={{ base: 'xs-12', md: 'xs-14' }}
                lineHeight={{ base: 'xs-12', md: 'xs-14' }}
                fontWeight={'500'}
              >
                {option.label}
              </Text>
              {isSelected ? <i className="ri-check-fill" /> : ''}
              <Radio value={option.value} hidden disabled={option.isDisabled} />
            </Flex>
          );
        })}
      </Flex>
    </RadioGroup>
  );
};

export default EventOptions;
