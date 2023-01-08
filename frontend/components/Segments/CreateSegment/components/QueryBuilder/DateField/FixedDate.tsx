import { SegmentFixedDateFilter } from '@lib/domain/segment';
import React, { useEffect, useState } from 'react';
import { DateRange } from 'react-date-range';
import { addDays } from 'date-fns';
import { getDateStringFromDate } from '@components/Segments/util';

type FixedDateProps = {
  fixedDateRange: SegmentFixedDateFilter;
  days: number;
  setFixedDateRange: Function;
};

const FixedDate = ({
  fixedDateRange,
  setFixedDateRange,
  days,
}: FixedDateProps) => {
  const [dateRange, setDateRange] = useState(
    fixedDateRange?.start_date && fixedDateRange?.end_date
      ? [
          {
            startDate: new Date(fixedDateRange?.start_date),
            endDate: new Date(fixedDateRange?.end_date),
            key: 'selection',
          },
        ]
      : [
          {
            startDate: addDays(new Date(), -days || -30),
            endDate: new Date(),
            key: 'selection',
          },
        ]
  );

  const handleChange = (item: any) => {
    setDateRange([item.selection]);
  };

  useEffect(() => {
    setFixedDateRange({
      start_date: getDateStringFromDate(dateRange[0].startDate),
      end_date: getDateStringFromDate(dateRange[0].endDate),
    });
  }, [dateRange]);

  return (
    <DateRange
      editableDateInputs={true}
      onChange={handleChange}
      moveRangeOnFirstSelection={false}
      ranges={dateRange}
      direction={'vertical'}
      maxDate={new Date()}
      scroll={{ enabled: true }}
      rangeColors={['#EDEDED']}
    />
  );
};

export default FixedDate;
