import { Input } from '@chakra-ui/react';
import { SegmentFilter } from '@lib/domain/segment';
import React, { KeyboardEvent, useEffect, useRef, useState } from 'react';

type InputValueProps = {
  index: number;
  filter: SegmentFilter;
  filters: SegmentFilter[];
  updateGroupsState: Function;
};

const InputValue = ({
  index,
  filter,
  filters,
  updateGroupsState,
}: InputValueProps) => {
  const inputSearchRef = useRef<HTMLInputElement>(null);
  const [inputCount, setInputCount] = useState(filter.values[0]);

  useEffect(() => {
    // need to update values whenever filter changes
    // case - when filter gets deleted, input field
    // should have correct value
    setInputCount(filter.values[0]);
  }, [filter]);

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
      bg={'white.100'}
      focusBorderColor={'black.100'}
      borderRadius={'4'}
      value={inputCount}
      onChange={(e) => setInputCount(e.target.value)}
      onBlur={updateFilterValue}
      onKeyDown={handleKeyDown}
      placeholder={'Value...'}
    />
  );
};

export default InputValue;
