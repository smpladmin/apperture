import { Select } from '@chakra-ui/react';
import { Schedule } from '@lib/domain/datamartActions';
import { GREY_600 } from '@theme/index';
import { CaretDown } from 'phosphor-react';
import React from 'react';

const DaySelect = ({
  schedule,
  setSchedule,
}: {
  schedule: Schedule | {};
  setSchedule: React.Dispatch<React.SetStateAction<Schedule | {}>>;
}) => {
  const daysOfWeek = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  const dayOptions = daysOfWeek.map((day, index) => (
    <option key={index} value={day}>
      {day}
    </option>
  ));

  return (
    <Select
      icon={<CaretDown fontSize={'14px'} color={GREY_600} />}
      size={'sm'}
      minWidth={'27'}
      width={'27'}
      h={'8'}
      fontSize={'xs-12'}
      lineHeight={'xs-12'}
      fontWeight={'400'}
      color={'grey.900'}
      border={'0.4px solid #BDBDBD'}
      borderRadius={'6'}
      focusBorderColor={'grey.900'}
      value={(schedule as Schedule)?.day || ''}
      placeholder="Select Day"
      textAlign={'center'}
      onChange={(e) => {
        setSchedule((prevSchedule) => ({
          ...prevSchedule,
          day: e.target.value,
        }));
      }}
    >
      {dayOptions}
    </Select>
  );
};

export default DaySelect;
