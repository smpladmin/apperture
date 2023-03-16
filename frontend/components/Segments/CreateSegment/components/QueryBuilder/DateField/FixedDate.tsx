import React, { useEffect, useState } from 'react';
import { DateRange, RangeKeyDict } from 'react-date-range';
import { addDays } from 'date-fns';
import { getDateStringFromDate } from '@components/Segments/util';
import { Box } from '@chakra-ui/react';
import { WHITE_200 } from '@theme/index';
import { FixedDateFilter } from '@lib/domain/common';

type FixedDateProps = {
  fixedDateRange: FixedDateFilter;
  days: number;
  setFixedDateRange: Function;
};

const FixedDate = ({
  fixedDateRange,
  setFixedDateRange,
  days,
}: FixedDateProps) => {
  const [dateRange, setDateRange] = useState<
    {
      startDate?: Date;
      endDate?: Date;
      key?: string;
    }[]
  >(
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

  const handleChange = (item: RangeKeyDict) => {
    setDateRange([item.selection]);
  };

  useEffect(() => {
    setFixedDateRange({
      start_date: getDateStringFromDate(dateRange[0].startDate!!),
      end_date: getDateStringFromDate(dateRange[0].endDate!!),
    });
  }, [dateRange]);

  return (
    <Box data-testid={'fixed-date-range'}>
      <DateRange
        editableDateInputs={true}
        onChange={handleChange}
        moveRangeOnFirstSelection={false}
        retainEndDateOnFirstSelection={true}
        ranges={dateRange}
        direction={'vertical'}
        maxDate={new Date()}
        scroll={{ enabled: true }}
        rangeColors={[WHITE_200]}
      />
    </Box>
  );
};

export default FixedDate;
