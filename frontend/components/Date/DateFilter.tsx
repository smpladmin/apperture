import { Box, Button, ButtonGroup } from '@chakra-ui/react';
import DateRangeSelector from '@components/Date/DateRangeSelector';
import {
  DateFilter,
  FixedDateFilter,
  DateFilterType,
  LastDateFilter,
  DateFilterObj,
} from '@lib/domain/common';
import { DatePickerRange } from '@lib/domain/metric';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import React, { useRef, useState } from 'react';
import { formatDateIntoString } from '@lib/utils/common';
import isEqual from 'lodash/isEqual';

type DateFilterProps = {
  dateFilter: DateFilterObj;
  setDateFilter: Function;
  isDisabled?: boolean;
};

const DateFilter = ({
  dateFilter,
  setDateFilter,
  isDisabled,
}: DateFilterProps) => {
  const datePickerRef = useRef(null);

  const startDate = (dateFilter.filter as FixedDateFilter)?.start_date
    ? new Date((dateFilter.filter as FixedDateFilter)?.start_date)
    : new Date();

  const endDate = (dateFilter.filter as FixedDateFilter)?.end_date
    ? new Date((dateFilter.filter as FixedDateFilter)?.end_date)
    : new Date();

  const dateFilterType = dateFilter?.type;

  const [dateRange] = useState({ startDate, endDate });
  const [openCustom, setOpenCustom] = useState<boolean>(false);
  useOnClickOutside(datePickerRef, () => setOpenCustom(false));

  const toggleFilterState = (
    filterType: DateFilterType,
    filterValue: DateFilter
  ) => {
    // unselect date filter if applied filter is clicked
    if (isEqual(filterValue, dateFilter.filter)) {
      setDateFilter({ filter: null, type: null });
    } else {
      setDateFilter({ filter: filterValue, type: filterType });
    }
  };

  const handleClickYesterday = () => {
    toggleFilterState(DateFilterType.LAST, { days: 1 });
  };

  const handleClickWeek = () => {
    toggleFilterState(DateFilterType.LAST, { days: 7 });
  };

  const handleClickMonth = () => {
    toggleFilterState(DateFilterType.LAST, { days: 30 });
  };

  const handleClickQuarter = () => {
    toggleFilterState(DateFilterType.LAST, { days: 90 });
  };

  const handleClickCustom = () => {
    setOpenCustom((prevState) => !prevState);
  };

  const handleCustomSubmit = (dateRange: DatePickerRange) => {
    const { startDate, endDate } = dateRange;

    setDateFilter({
      filter: {
        start_date: formatDateIntoString(startDate),
        end_date: formatDateIntoString(endDate),
      },
      type: DateFilterType.FIXED,
    });
    setOpenCustom((prevState) => !prevState);
  };

  const handleCustomCancel = () => {
    setOpenCustom((prevState) => !prevState);
    setDateFilter({ filter: null, type: null });
  };

  const isLastDateFilterSelected = {
    '1D': !!((dateFilter.filter as LastDateFilter)?.days === 1),
    '1W': !!((dateFilter.filter as LastDateFilter)?.days === 7),
    '1M': !!((dateFilter.filter as LastDateFilter)?.days === 30),
    '3M': !!((dateFilter.filter as LastDateFilter)?.days === 90),
  };

  return (
    <ButtonGroup size="sm" isAttached variant="outline" isDisabled={isDisabled}>
      <Button
        border="1px solid #EDEDED"
        id="yesterday"
        background={isLastDateFilterSelected['1D'] ? 'grey.50' : 'none'}
        color={isLastDateFilterSelected['1D'] ? 'black' : 'grey.200'}
        fontWeight={isLastDateFilterSelected['1D'] ? 500 : 400}
        _hover={{
          background: 'white.100',
        }}
        height={8}
        fontSize={'xs-12'}
        onClick={handleClickYesterday}
        data-testid={'yesterday'}
      >
        Yesterday
      </Button>
      <Button
        border="1px solid #EDEDED"
        id="yesterday"
        background={isLastDateFilterSelected['1W'] ? 'grey.50' : 'none'}
        color={isLastDateFilterSelected['1W'] ? 'black' : 'grey.200'}
        fontWeight={isLastDateFilterSelected['1W'] ? 500 : 400}
        _hover={{
          background: 'white.100',
        }}
        height={8}
        fontSize={'xs-12'}
        onClick={handleClickWeek}
        data-testid={'week'}
      >
        1W
      </Button>
      <Button
        border="1px solid #EDEDED"
        id="yesterday"
        background={isLastDateFilterSelected['1M'] ? 'grey.50' : 'none'}
        color={isLastDateFilterSelected['1M'] ? 'black' : 'grey.200'}
        fontWeight={isLastDateFilterSelected['1M'] ? 500 : 400}
        _hover={{
          background: 'white.100',
        }}
        height={8}
        fontSize={'xs-12'}
        onClick={handleClickMonth}
        data-testid={'month'}
      >
        1M
      </Button>
      <Button
        border="1px solid #EDEDED"
        id="yesterday"
        background={isLastDateFilterSelected['3M'] ? 'grey.50' : 'none'}
        color={isLastDateFilterSelected['3M'] ? 'black' : 'grey.200'}
        fontWeight={isLastDateFilterSelected['3M'] ? 500 : 400}
        _hover={{
          background: 'white.100',
        }}
        height={8}
        fontSize={'xs-12'}
        onClick={handleClickQuarter}
        borderRadius={0}
        data-testid={'three-months'}
      >
        3M
      </Button>

      <Box position="relative" ref={datePickerRef}>
        <Button
          border="1px solid #EDEDED"
          id="yesterday"
          background={
            dateFilterType === DateFilterType.FIXED ? 'grey.50' : 'none'
          }
          color={dateFilterType === DateFilterType.FIXED ? 'black' : 'grey.200'}
          fontWeight={dateFilterType === DateFilterType.FIXED ? 500 : 400}
          _hover={{
            background: 'white.100',
          }}
          height={8}
          fontSize={'xs-12'}
          borderLeftRadius={0}
          borderLeft={'none'}
          onClick={handleClickCustom}
          data-testid={'custom'}
        >
          <i style={{ marginRight: '4px' }} className="ri-calendar-line" />{' '}
          {dateFilterType === DateFilterType.FIXED
            ? `${formatDateIntoString(
                startDate,
                'DD/MM/YYYY'
              )} to ${formatDateIntoString(endDate, 'DD/MM/YYYY')}`
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
