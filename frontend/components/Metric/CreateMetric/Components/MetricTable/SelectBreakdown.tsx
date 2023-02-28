import { Checkbox, Flex, Text } from '@chakra-ui/react';
import React, { ChangeEvent } from 'react';
import { COLOR_PALLETE_5 } from '../MetricTrend';

type SelectBreakdownProps = {
  info: any;
  selectedBreakdowns: string[];
  setSelectedBreakdowns: Function;
};

const SelectBreakdown = ({
  info,
  selectedBreakdowns,
  setSelectedBreakdowns,
}: SelectBreakdownProps) => {
  const { name, propertyValue } = info?.row?.original;
  const value = `${name}/${propertyValue}`;

  const handleChangeBreakdown = (e: ChangeEvent<HTMLInputElement>) => {
    let toUpdateBreakdowns = [...selectedBreakdowns];

    if (e.target.checked) {
      // if (selectedBreakdowns.length >= 10) return;
      toUpdateBreakdowns.push(e.target.value);
      setSelectedBreakdowns(toUpdateBreakdowns);
    } else {
      toUpdateBreakdowns = toUpdateBreakdowns.filter(
        (breakdown) => breakdown !== e.target.value
      );
      setSelectedBreakdowns(toUpdateBreakdowns);
    }
  };

  const getCheckBoxColorScheme = () => {
    let selectionIndex = selectedBreakdowns.indexOf(value);

    if (selectionIndex != -1) {
      selectionIndex = selectionIndex % 5;
      return COLOR_PALLETE_5[selectionIndex]?.colorName;
    }
  };

  return (
    <Flex as={'label'} gap={'2'} alignItems={'baseline'} cursor={'pointer'}>
      <Checkbox
        value={value}
        isChecked={selectedBreakdowns.includes(value)}
        onChange={handleChangeBreakdown}
        colorScheme={getCheckBoxColorScheme()}
      />
      <Text>{info.getValue()}</Text>
    </Flex>
  );
};

export default SelectBreakdown;
