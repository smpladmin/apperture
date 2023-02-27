import { Box, Checkbox, Flex, Text } from '@chakra-ui/react';
import React, { ChangeEvent } from 'react';

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
  console.log('selected breakdowns', selectedBreakdowns);
  const { name, propertyValue } = info?.row?.original;

  const handleChangeBreakdown = (e: ChangeEvent<HTMLInputElement>) => {
    let toUpdateBreakdowns = [...selectedBreakdowns];

    if (e.target.checked) {
      if (selectedBreakdowns.length >= 5) return;

      toUpdateBreakdowns.push(e.target.value);
      setSelectedBreakdowns(toUpdateBreakdowns);
    } else {
      toUpdateBreakdowns = toUpdateBreakdowns.filter(
        (breakdown) => breakdown !== e.target.value
      );
      setSelectedBreakdowns(toUpdateBreakdowns);
    }
  };

  return (
    <Flex as={'label'} gap={'2'} alignItems={'baseline'} cursor={'pointer'}>
      <Checkbox
        value={`${name}/${propertyValue}`}
        isChecked={selectedBreakdowns.includes(`${name}/${propertyValue}`)}
        onChange={handleChangeBreakdown}
      />
      <Text>{info.getValue()}</Text>
    </Flex>
  );
};

export default SelectBreakdown;
