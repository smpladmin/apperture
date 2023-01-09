import { Box, Flex, Text } from '@chakra-ui/react';
import Dropdown from '@components/SearchableDropdown/Dropdown';
import { getMonthDateYearFormattedString } from '@components/Segments/util';
import {
  SegmentDateFilterType,
  SegmentFilter,
  SegmentFixedDateFilter,
  SegmentLastDateFilter,
  SegmentSinceDateFilter,
  WhoSegmentFilter,
} from '@lib/domain/segment';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import React, { useRef, useState } from 'react';
import ApplyAndCancel from './ApplyAndCancel';
import DateFilterType from './DateFilterTypeOptions';
import FixedDate from './FixedDate';
import LastNDays from './LastNDays';
import SinceStartDate from './SinceStartDate';

type DateFieldProps = {
  index: number;
  filter: WhoSegmentFilter;
  filters: SegmentFilter[];
  updateGroupsState: Function;
};

const DateField = ({
  index,
  filter,
  filters,
  updateGroupsState,
}: DateFieldProps) => {
  const dateFieldRef = useRef(null);
  const [isDateFieldBoxOpen, setisDateFieldBoxOpen] = useState(false);
  const [selectedDateFilterType, setSelectedDateFilterType] = useState(
    filter.date_filter_type || ''
  );

  const [days, setDays] = useState(
    (filter.date_filter as SegmentLastDateFilter)?.days?.toString() || ''
  );
  const [sinceStartDate, setSinceStartDate] = useState({
    start_date:
      (filter.date_filter as SegmentSinceDateFilter)?.start_date || '',
  });
  const [fixedDateRange, setFixedDateRange] = useState({
    start_date: (filter.date_filter as SegmentFixedDateFilter).start_date || '',
    end_date: (filter.date_filter as SegmentFixedDateFilter).end_date || '',
  });

  const closeDropdown = () => {
    setisDateFieldBoxOpen(false);
    setSelectedDateFilterType(filter.date_filter_type);
  };

  useOnClickOutside(dateFieldRef, closeDropdown);

  const dateFilterObj = {
    [SegmentDateFilterType.LAST]: {
      label: `Last ${(filter.date_filter as SegmentLastDateFilter).days} days`,
      value: { days: +days },
      component: <LastNDays days={days} setDays={setDays} />,
    },
    [SegmentDateFilterType.SINCE]: {
      label: `Since ${getMonthDateYearFormattedString(
        (filter.date_filter as SegmentSinceDateFilter).start_date
      )}`,
      value: sinceStartDate,
      component: (
        <SinceStartDate
          sinceStartDate={sinceStartDate}
          setSinceStartDate={setSinceStartDate}
          days={+days}
        />
      ),
    },
    [SegmentDateFilterType.FIXED]: {
      label: `${getMonthDateYearFormattedString(
        (filter.date_filter as SegmentFixedDateFilter).start_date
      )} - ${getMonthDateYearFormattedString(
        (filter.date_filter as SegmentFixedDateFilter).end_date
      )}`,
      value: fixedDateRange,
      component: (
        <FixedDate
          fixedDateRange={fixedDateRange}
          setFixedDateRange={setFixedDateRange}
          days={+days}
        />
      ),
    },
  };

  const handleDateChange = () => {
    const updatedFilters = [...filters];

    (updatedFilters[index] as WhoSegmentFilter)['date_filter'] =
      dateFilterObj[selectedDateFilterType]['value'];

    (updatedFilters[index] as WhoSegmentFilter)['date_filter_type'] =
      selectedDateFilterType;

    updateGroupsState(updatedFilters);
    closeDropdown();
  };

  const getDateDisplayValue = () => {
    return (
      <Flex
        alignItems={'center'}
        bg={'white.100'}
        px={'2'}
        p={'3'}
        gap={'2'}
        onClick={() => {
          setisDateFieldBoxOpen(true);
        }}
        data-testid={'date-field'}
        cursor={'pointer'}
      >
        <i className="ri-calendar-line"></i>
        <Text fontSize={'xs-14'} lineHeight={'xs-14'} fontWeight={'600'}>
          {dateFilterObj[filter.date_filter_type]['label']}
        </Text>
      </Flex>
    );
  };

  return (
    <Box w={'auto'} ref={dateFieldRef} position="relative">
      {getDateDisplayValue()}
      <Dropdown isOpen={isDateFieldBoxOpen} maxHeight={120}>
        <Flex direction={'column'} gap={'6'}>
          <DateFilterType
            selectedDateFilterType={selectedDateFilterType}
            setSelectedDateFIlterType={setSelectedDateFilterType}
          />
          <Box maxH={'80'} overflow={'scroll'}>
            {dateFilterObj[selectedDateFilterType]['component']}
          </Box>
          <ApplyAndCancel
            closeDropdown={closeDropdown}
            handleDateChange={handleDateChange}
          />
        </Flex>
      </Dropdown>
    </Box>
  );
};

export default DateField;
