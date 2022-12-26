import { Input } from '@chakra-ui/react';
import { SegmentFilter } from '@lib/domain/segment';
import React, { KeyboardEvent, useRef, useState } from 'react';

type InputValueProps = {
  index: number;
  filters: SegmentFilter[];
  updateGroupsState: Function;
};

const InputValue = ({ index, filters, updateGroupsState }: InputValueProps) => {
  const inputSearchRef = useRef<HTMLInputElement>(null);

  const [inputCount, setInputCount] = useState('1');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      updateFilterValue();
      inputSearchRef.current?.blur();
    }
  };

  const updateFilterValue = () => {
    const updatedFilters = [...filters];
    updatedFilters[index]['values'] = [inputCount];
    updateGroupsState(updatedFilters);
  };

  return (
    <Input
      ref={inputSearchRef}
      type={'number'}
      size={'sm'}
      w={'20'}
      focusBorderColor={'black.100'}
      borderRadius={'4'}
      value={inputCount}
      onChange={(e) => setInputCount(e.target.value)}
      onFocus={updateFilterValue}
      onBlur={updateFilterValue}
      onKeyDown={handleKeyDown}
      placeholder={'Value...'}
      autoFocus
    />
  );
};

export default InputValue;
