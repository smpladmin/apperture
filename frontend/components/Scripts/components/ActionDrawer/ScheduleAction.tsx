// ScheduleAction.tsx
import { Flex, Radio, RadioGroup, Text, Select } from '@chakra-ui/react';
import { ActionFrequency, ActionType, Schedule } from '@lib/domain/datamartActions';
import { capitalizeFirstLetter } from '@lib/utils/common';
import React, { useState } from 'react';
import TimeSelect from './TimeSelect';
import DaySelect from './DaySelect';
import DateSelect from './DateSelect';
import { DataMartObj } from '@lib/domain/datamart';
import ToggleButton from './ToggleButton';

type ScheduleActionProps = {
  schedule: Schedule | {};
  setSchedule: React.Dispatch<React.SetStateAction<Schedule | {}>>;
  savedDataMarts: DataMartObj[];
  selectedAction: ActionType | undefined;
};

const ScheduleAction = ({ schedule, setSchedule, savedDataMarts, selectedAction }: ScheduleActionProps) => {
  const FrequencyOptions = Object.values(ActionFrequency);
  const frequency = (schedule as Schedule)?.frequency;
  const selectedDataMart = (schedule as Schedule)?.datamartId || '';
  const [isTriggerBased, setIsTriggerBased] = useState(() => frequency === ActionFrequency.DATAMART);

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
      {selectedAction === ActionType.TABLE && (
        <ToggleButton isTriggerBased={isTriggerBased} setIsTriggerBased={setIsTriggerBased} />
      )}
      <RadioGroup
        value={frequency}
        onChange={(value: string) => {
          setSchedule((prevSchedule) => ({
            ...prevSchedule,
            frequency: value,
            day: null,
            date: null,
            time: null,
            datamartId: null,
          }));
        }}
      >
        <Flex gap={'3'}>
          {FrequencyOptions.map((frequencyOption) => {
            return isTriggerBased === false && frequencyOption !== ActionFrequency.DATAMART && (
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
      {frequency && isTriggerBased === false && (
        <Flex alignItems={'center'} gap={'3'}>
          {isTriggerBased === false && frequency !== ActionFrequency.QUARTER_HOURLY && frequency !== ActionFrequency.HALF_HOURLY && frequency !== ActionFrequency.DATAMART && (
            <>
              <Text
                fontSize={'xs-12'}
                lineHeight={'xs-12'}
                fontWeight={'400'}
                color={'grey.900'}
              >
                at
              </Text>
              <TimeSelect schedule={schedule} setSchedule={setSchedule} isHourly={frequency === ActionFrequency.HOURLY} />
            </>
          )}
          {isTriggerBased === false && frequency === ActionFrequency.WEEKLY && (
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
          {isTriggerBased === false && frequency === ActionFrequency.MONTHLY && (
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
      {selectedAction === ActionType.TABLE && isTriggerBased && (
        <Flex alignItems={'center'} gap={'3'}>
          {isTriggerBased && (
            <>
              <Text
                fontSize={'xs-12'}
                lineHeight={'xs-12'}
                fontWeight={'400'}
                color={'grey.900'}
              >
                after table
              </Text>
              <Select
                placeholder="Select a table"
                value={selectedDataMart}
                onChange={(e) => {
                  console.log("VP: e: ", e);
                  setSchedule((prevSchedule) => ({
                    ...prevSchedule,
                    frequency: ActionFrequency.DATAMART,
                    day: null,
                    date: null,
                    time: null,
                    datamartId: e.target.value,
                  }))
                }
                }
                size="sm"
                width="200px"
              >
                {savedDataMarts.map((savedDataMart) => (
                  <option key={savedDataMart._id} value={savedDataMart._id}>
                    {savedDataMart.name}
                  </option>
                ))}
              </Select>
            </>
          )}
        </Flex>
      )}
    </Flex>
  );
};

export default ScheduleAction;
