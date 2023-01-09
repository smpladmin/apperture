import { getDateStringFromDate } from '@components/Segments/util';
import { SegmentSinceDateFilter } from '@lib/domain/segment';
import React, { useEffect, useState } from 'react';
import { addDays, format } from 'date-fns';
import { Calendar } from 'react-date-range';
import { Box, Input } from '@chakra-ui/react';

type SinceStartDateProps = {
  sinceStartDate: SegmentSinceDateFilter;
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
    <Box>
      <Input
        value={format(startDate, 'MMM d, yyyy')}
        readOnly
        focusBorderColor="black.100"
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
