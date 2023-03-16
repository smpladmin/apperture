import { getDateStringFromDate } from '@components/Segments/util';
import React, { useEffect, useState } from 'react';
import { addDays, format } from 'date-fns';
import { Calendar } from 'react-date-range';
import { Box, Input } from '@chakra-ui/react';
import { SinceDateFilter } from '@lib/domain/common';

type SinceStartDateProps = {
  sinceStartDate: SinceDateFilter;
  setSinceStartDate: Function;
  days: number;
};

const SinceStartDate = ({
  sinceStartDate,
  setSinceStartDate,
  days,
}: SinceStartDateProps) => {
  const [startDate, setStartDate] = useState(
    sinceStartDate.start_date
      ? new Date(sinceStartDate.start_date)
      : addDays(new Date(), -days || -30)
  );

  useEffect(() => {
    setSinceStartDate({
      start_date: getDateStringFromDate(startDate),
    });
  }, [startDate]);

  return (
    <Box data-testid={'since-start-date'}>
      <Input
        value={format(startDate, 'MMM d, yyyy')}
        readOnly
        focusBorderColor="black.100"
        data-testid={'since-start-date-input'}
      />
      <Calendar
        onChange={(item) => setStartDate(item)}
        date={startDate}
        maxDate={new Date()}
      />
    </Box>
  );
};

export default SinceStartDate;
