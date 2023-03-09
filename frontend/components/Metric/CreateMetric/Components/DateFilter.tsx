import { Box, Button, ButtonGroup } from '@chakra-ui/react';
import DateRangeSelector from '@components/Date/DateRangeSelector';
import {
  DateFilterType,
  DatePickerRange,
  DateRangeType,
} from '@lib/domain/metric';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import React, { useRef, useState } from 'react';

type DateFilterProps = {
  dateRange: DateRangeType | null;
  setDateRange: Function;
};

const DateFilter = ({ setDateRange, dateRange }: DateFilterProps) => {
  const datePickerRef = useRef(null);
  const [selectedFilter, setselectedFilter] = useState<DateFilterType>(
    dateRange ? DateFilterType.CUSTOM : DateFilterType.UNSET
  );

  const today = new Date();

  const [openCustom, setOpenCustom] = useState<boolean>(false);
  useOnClickOutside(datePickerRef, () => setOpenCustom(false));

  const toggleFilterState = (
    filterType: DateFilterType,
    startDate: Date,
    endDate: Date
  ) => {
    if (filterType === selectedFilter) {
      setselectedFilter(DateFilterType.UNSET);
      setDateRange(null);
    } else {
      setselectedFilter(filterType);
      setDateRange({ startDate, endDate });
    }
  };

  const handleClickYesterday = () => {
    const yesterday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - 1
    );
    toggleFilterState(DateFilterType.YESTERDAY, yesterday, today);
  };

  const handleClickWeek = () => {
    const lastWeek = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - 7
    );
    toggleFilterState(DateFilterType.WEEK, lastWeek, today);
  };

  const handleClickMonth = () => {
    const lastMonth = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      today.getDate()
    );
    toggleFilterState(DateFilterType.MONTH, lastMonth, today);
  };

  const handleClickQuarter = () => {
    const lastQuarter = new Date(
      today.getFullYear(),
      today.getMonth() - 3,
      today.getDate()
    );
    toggleFilterState(DateFilterType.QUARTER, lastQuarter, today);
  };

  const handleClickCustom = () => {
    setOpenCustom((prevState) => !prevState);
  };

  const handleCustomSubmit = (dateRange: DatePickerRange) => {
    const { startDate, endDate } = dateRange;
    setDateRange({ startDate, endDate });
    setOpenCustom((prevState) => !prevState);
    setselectedFilter(DateFilterType.CUSTOM);
  };
  const handleCustomCancel = () => {
    setOpenCustom((prevState) => !prevState);
    setDateRange(null);
    setselectedFilter(DateFilterType.UNSET);
  };

  return (
    <ButtonGroup size="sm" isAttached variant="outline">
      <Button
        border="1px solid #EDEDED"
        id="yesterday"
        background={
          selectedFilter === DateFilterType.YESTERDAY ? 'grey.50' : 'none'
        }
        color={
          selectedFilter === DateFilterType.YESTERDAY ? 'black' : 'grey.200'
        }
        fontWeight={selectedFilter === DateFilterType.YESTERDAY ? 500 : 400}
        height={8}
        fontSize={'xs-12'}
        onClick={handleClickYesterday}
      >
        Yesterday
      </Button>
      <Button
        border="1px solid #EDEDED"
        id="yesterday"
        background={selectedFilter === DateFilterType.WEEK ? 'grey.50' : 'none'}
        color={selectedFilter === DateFilterType.WEEK ? 'black' : 'grey.200'}
        fontWeight={selectedFilter === DateFilterType.WEEK ? 500 : 400}
        height={8}
        fontSize={'xs-12'}
        onClick={handleClickWeek}
      >
        1W
      </Button>
      <Button
        border="1px solid #EDEDED"
        id="yesterday"
        background={
          selectedFilter === DateFilterType.MONTH ? 'grey.50' : 'none'
        }
        color={selectedFilter === DateFilterType.MONTH ? 'black' : 'grey.200'}
        fontWeight={selectedFilter === DateFilterType.MONTH ? 500 : 400}
        height={8}
        fontSize={'xs-12'}
        onClick={handleClickMonth}
      >
        1M
      </Button>
      <Button
        border="1px solid #EDEDED"
        id="yesterday"
        background={
          selectedFilter === DateFilterType.QUARTER ? 'grey.50' : 'none'
        }
        color={selectedFilter === DateFilterType.QUARTER ? 'black' : 'grey.200'}
        fontWeight={selectedFilter === DateFilterType.QUARTER ? 500 : 400}
        height={8}
        fontSize={'xs-12'}
        onClick={handleClickQuarter}
        borderRadius={0}
      >
        3M
      </Button>

      <Box position="relative" ref={datePickerRef}>
        <Button
          border="1px solid #EDEDED"
          id="yesterday"
          background={
            selectedFilter === DateFilterType.CUSTOM ? 'grey.50' : 'none'
          }
          color={
            selectedFilter === DateFilterType.CUSTOM ? 'black' : 'grey.200'
          }
          fontWeight={selectedFilter === DateFilterType.CUSTOM ? 500 : 400}
          height={8}
          fontSize={'xs-12'}
          borderLeftRadius={0}
          borderLeft={'none'}
          onClick={handleClickCustom}
        >
          <i style={{ marginRight: '4px' }} className="ri-calendar-line" />{' '}
          {selectedFilter === DateFilterType.CUSTOM && dateRange
            ? `${dateRange?.startDate.toLocaleString().split(',')[0]} to ${
                dateRange?.endDate.toLocaleString().split(',')[0]
              }`
            : 'Custom'}
        </Button>
        <DateRangeSelector
          isOpen={openCustom}
          dateRange={dateRange}
          handleSubmit={handleCustomSubmit}
          handleCancel={handleCustomCancel}
        />
      </Box>
    </ButtonGroup>
  );
};

export default DateFilter;
