import { Flex, Radio, RadioGroup, Select, Text } from '@chakra-ui/react';
import { Schedule, TimePeriod } from '@lib/domain/datamartActions';
import { GREY_600 } from '@theme/index';
import { CaretDown } from 'phosphor-react';
import React from 'react';

const TimeSelect = ({
  schedule,
  setSchedule,
}: {
  schedule: Schedule | {};
  setSchedule: React.Dispatch<React.SetStateAction<Schedule | {}>>;
}) => {
  const generateTimes = () => {
    const times = [];
    for (let hour = 1; hour <= 12; hour++) {
      for (let m = 0; m < 60; m += 15) {
        const minute = m < 10 ? `0${m}` : m;
        times.push(`${hour}:${minute}`);
      }
    }
    return times;
  };

  const timeOptions = generateTimes().map((time, index) => (
    <option key={index} value={time}>
      {time}
    </option>
  ));

  return (
    <Flex alignItems={'center'} gap={'1'}>
      <Select
        icon={<CaretDown fontSize={'14px'} color={GREY_600} />}
        size={'sm'}
        minWidth={'20'}
        width={'20'}
        fontSize={'xs-12'}
        lineHeight={'xs-12'}
        fontWeight={'400'}
        color={'grey.900'}
        h={'8'}
        border={'0.4px solid #BDBDBD'}
        borderRadius={'6'}
        focusBorderColor={'grey.900'}
        value={(schedule as Schedule)?.time || ''}
        placeholder="Time"
        textAlign={'center'}
        onChange={(e) => {
          setSchedule((prevSchedule) => ({
            ...prevSchedule,
            time: e.target.value,
          }));
        }}
      >
        {timeOptions}
      </Select>

      <RadioGroup
        value={(schedule as Schedule)?.period}
        onChange={(value: string) => {
          setSchedule((prevSchedule) => ({
            ...prevSchedule,
            period: value,
          }));
        }}
      >
        <Flex>
          {Object.values(TimePeriod).map((period) => {
            return (
              <Flex
                key={period}
                cursor={'pointer'}
                as={'label'}
                py={'6px'}
                px={'2'}
                border={'0.4px solid #BDBDBD'}
                borderColor={'grey.700'}
                borderWidth={'1px'}
                borderLeftWidth={period === TimePeriod.AM ? '1px' : 0}
                borderRadius={
                  period === TimePeriod.AM ? '4px 0 0 4px' : '0 4px 4px 0'
                }
                bg={
                  (schedule as Schedule)?.period === period ? 'white.200' : ''
                }
              >
                <Text
                  fontSize={'xs-10'}
                  lineHeight={'xs-10'}
                  fontWeight={'400'}
                  color={'grey.900'}
                >
                  {period.toLocaleUpperCase()}
                </Text>
                <Radio hidden value={period} />
              </Flex>
            );
          })}
        </Flex>
      </RadioGroup>
    </Flex>
  );
};

export default TimeSelect;
