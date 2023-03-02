import { Checkbox, Flex, Text } from '@chakra-ui/react';
import { COLOR_PALLETE_5 } from '@components/Metric/util';
import { Breakdown } from '@lib/domain/metric';
import React, { ChangeEvent } from 'react';

type SelectBreakdownProps = {
  info: any;
  selectedBreakdowns: Breakdown[];
  setSelectedBreakdowns: Function;
};

const SelectBreakdown = ({
  info,
  selectedBreakdowns,
  setSelectedBreakdowns,
}: SelectBreakdownProps) => {
  const {
    index,
    original: { name, propertyValue },
  } = info?.row;

  // console.log('info', info.row);
  const value = `${name}/${propertyValue}`;

  const handleChangeBreakdown = (e: ChangeEvent<HTMLInputElement>) => {
    let toUpdateBreakdowns = [...selectedBreakdowns];

    if (e.target.checked) {
      if (selectedBreakdowns.length >= 10) return;

      toUpdateBreakdowns.push({ value: e.target.value, rowIndex: index });
      setSelectedBreakdowns(toUpdateBreakdowns);
    } else {
      toUpdateBreakdowns = toUpdateBreakdowns.filter(
        (breakdown) => breakdown.value !== e.target.value
      );
      setSelectedBreakdowns(toUpdateBreakdowns);
    }
  };

  const getCheckBoxColorScheme = () => {
    // console.log('selected', selectedBreakdowns);
    let selectionIndex = selectedBreakdowns.find(
      (breakdown) => breakdown.rowIndex == index
    )?.rowIndex;

    if (selectionIndex) {
      selectionIndex = selectionIndex % 5;
      return COLOR_PALLETE_5[selectionIndex]?.colorName;
    }
  };

  return (
    <Flex as={'label'} gap={'2'} alignItems={'baseline'} cursor={'pointer'}>
      <Checkbox
        value={value}
        isChecked={selectedBreakdowns.map(({ value }) => value).includes(value)}
        onChange={handleChangeBreakdown}
        colorScheme={getCheckBoxColorScheme()}
      />
      <Text>{info.getValue()}</Text>
    </Flex>
  );
};

export default SelectBreakdown;
