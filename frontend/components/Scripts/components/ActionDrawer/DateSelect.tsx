import { Box, Button } from '@chakra-ui/react';
import { Schedule } from '@lib/domain/datamartActions';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import { formatDateIntoString } from '@lib/utils/common';
import React, { useRef, useState } from 'react';
import { Calendar } from 'react-date-range';

const DateSelect = ({
  schedule,
  setSchedule,
}: {
  schedule: Schedule | {};
  setSchedule: React.Dispatch<React.SetStateAction<Schedule | {}>>;
}) => {
  const [openCalender, setOpenCalender] = useState(false);
  const datePickerRef = useRef(null);

  useOnClickOutside(datePickerRef, () => setOpenCalender(false));
  const scheduleDate = (schedule as Schedule)?.date;

  return (
    <Box position="relative" ref={datePickerRef}>
      <Button
        px={'3'}
        py={'2'}
        fontSize={'xs-12'}
        lineHeight={'xs-12'}
        fontWeight={'400'}
        color={'grey.900'}
        bg={'transparent'}
        h={'8'}
        border={'0.4px solid #BDBDBD'}
        onClick={() => setOpenCalender(!openCalender)}
      >
        {scheduleDate
          ? formatDateIntoString(new Date(scheduleDate), 'DD/MM/YYYY')
          : 'Choose a date'}
      </Button>
      {openCalender ? (
        <Box position="absolute" h={'50'} w={'50'}>
          <Calendar
            fixedHeight={true}
            minDate={new Date()}
            date={scheduleDate ? new Date(scheduleDate) : new Date()}
            onChange={(value) => {
              const date = formatDateIntoString(value);
              setSchedule((prevSchedule) => ({ ...prevSchedule, date }));
              setOpenCalender(false);
            }}
          />
        </Box>
      ) : null}
    </Box>
  );
};

export default DateSelect;
