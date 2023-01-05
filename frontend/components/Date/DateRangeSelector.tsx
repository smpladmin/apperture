import { Box, Button, Flex } from '@chakra-ui/react';
import React, { useState } from 'react';
import 'react-date-range/dist/styles.css'; // main css file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { DateRange } from 'react-date-range';
import { DatePickerRange, DateRangeType } from '@lib/domain/metric';
type DateRangeSelectorProps = {
  isOpen: boolean;
  handleCancel: React.MouseEventHandler<HTMLButtonElement>;
  handleSubmit: Function;
  dateRange: DateRangeType;
};

type DateRangeItem = {
  selection: DatePickerRange;
};

const DateRangeSelector = ({
  isOpen = false,
  handleCancel,
  handleSubmit,
  dateRange,
}: DateRangeSelectorProps) => {
  const [state, setState] = useState(
    dateRange?.startDate && dateRange?.endDate
      ? [
          {
            startDate: dateRange?.startDate,
            endDate: dateRange?.endDate,
            key: 'selection',
          },
        ]
      : [
          {
            startDate: new Date(),
            endDate: new Date(),
            key: 'selection',
          },
        ]
  );

  const handleChange = (item: any) => {
    setState([item.selection]);
  };

  const handleDone = () => {
    handleSubmit(state[0]);
  };

  if (isOpen)
    return (
      <Flex
        background={'white'}
        position={'absolute'}
        top={'110%'}
        zIndex={1}
        direction={'column'}
        border={' 1px solid #EDEDED'}
        p={2}
        borderRadius={'8px'}
      >
        <DateRange
          editableDateInputs={true}
          onChange={handleChange}
          moveRangeOnFirstSelection={false}
          ranges={state}
          rangeColors={['#EDEDED']}
        />
        <Flex width={'full'} gap={1}>
          <Button
            border={' 1px solid #EDEDED'}
            width={'50%'}
            variant={'secondary'}
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            border={' 1px solid #EDEDED'}
            width={'50%'}
            background={'black'}
            color={'white'}
            onClick={handleDone}
            _hover={{
              background: 'black',
              color: 'white',
            }}
          >
            Done
          </Button>
        </Flex>
      </Flex>
    );
  return <></>;
};

export default DateRangeSelector;
