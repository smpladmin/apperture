import { getDateStringFromDate } from '@components/Segments/util';
import { SegmentSinceDateFilter } from '@lib/domain/segment';
import React, { useEffect, useState } from 'react';
import { addDays } from 'date-fns';
import { Calendar } from 'react-date-range';

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
    <Calendar
      direction="vertical"
      onChange={(item) => setStartDate(item)}
      date={startDate}
    />
  );
};

export default SinceStartDate;
