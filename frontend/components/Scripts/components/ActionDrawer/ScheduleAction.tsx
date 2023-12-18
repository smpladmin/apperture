import { Flex, Radio, RadioGroup, Text } from '@chakra-ui/react';
import { ActionFrequency, Schedule } from '@lib/domain/datamartActions';
import { capitalizeFirstLetter } from '@lib/utils/common';
import React from 'react';
import TimeSelect from './TimeSelect';
import DaySelect from './DaySelect';
import DateSelect from './DateSelect';

type ScheduleActionProps = {
  schedule: Schedule | {};
  setSchedule: React.Dispatch<React.SetStateAction<Schedule | {}>>;
};

const ScheduleAction = ({ schedule, setSchedule }: ScheduleActionProps) => {
  const FrequencyOptions = Object.values(ActionFrequency);
  const frequency = (schedule as Schedule)?.frequency;

  return (
    <Flex mt={'4'} direction={'column'} gap={'3'}>
      <Text
        fontSize={'xs-12'}
        lineHeight={'xs-12'}
        fontWeight={'400'}
        color={'grey.800'}
      >
        How often do you want to update?
      </Text>
      <RadioGroup
        value={frequency}
        onChange={(value: string) => {
          setSchedule((prevSchedule) => ({
            ...prevSchedule,
            frequency: value,
            day: null,
            date: null,
            time: null,
            period: null,
          }));
        }}
      >
        <Flex gap={'3'}>
          {FrequencyOptions.map((frequencyOption) => {
            return (
              <Flex
                direction={'column'}
                gap={'2'}
                key={frequencyOption}
                cursor={'pointer'}
                as={'label'}
              >
                <Flex
                  borderWidth={'1px'}
                  borderRadius={'6'}
                  px={'3'}
                  py={'2'}
                  borderColor={
                    frequencyOption === frequency ? 'grey.900' : 'grey.700'
                  }
                  bg={
                    frequencyOption === frequency
                      ? 'white.400'
                      : 'white.DEFAULT'
                  }
                  fontSize={'xs-12'}
                  lineHeight={'xs-12'}
                  fontWeight={'400'}
                  color={'grey.900'}
                >
                  {capitalizeFirstLetter(frequencyOption)}
                </Flex>

                <Radio hidden value={frequencyOption} />
              </Flex>
            );
          })}
        </Flex>
      </RadioGroup>
      {frequency && (
        <Flex alignItems={'center'} gap={'3'}>
          {frequency !== ActionFrequency.HOURLY && (
            <>
              <Text
                fontSize={'xs-12'}
                lineHeight={'xs-12'}
                fontWeight={'400'}
                color={'grey.900'}
              >
                at
              </Text>
              <TimeSelect schedule={schedule} setSchedule={setSchedule} />
            </>
          )}
          {frequency === ActionFrequency.WEEKLY && (
            <>
              <Text
                fontSize={'xs-12'}
                lineHeight={'xs-12'}
                fontWeight={'400'}
                color={'grey.900'}
              >
                on
              </Text>
              <DaySelect schedule={schedule} setSchedule={setSchedule} />
            </>
          )}
          {frequency === ActionFrequency.MONTHLY && (
            <>
              <Text
                fontSize={'xs-12'}
                lineHeight={'xs-12'}
                fontWeight={'400'}
                color={'grey.900'}
              >
                start date
              </Text>
              <DateSelect schedule={schedule} setSchedule={setSchedule} />
            </>
          )}
        </Flex>
      )}
    </Flex>
  );
};

export default ScheduleAction;
