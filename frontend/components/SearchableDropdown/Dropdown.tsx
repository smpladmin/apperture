import { Box } from '@chakra-ui/react';
import React, { ReactNode, useEffect, useRef } from 'react';

type DropdownProps = {
  isOpen: boolean;
  dropdownPosition?: string;
  maxHeight?: number;
  children: ReactNode;
};

const Dropdown = ({
  isOpen,
  dropdownPosition,
  maxHeight = 102,
  children,
}: DropdownProps) => {
  const dropDownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    // scroll the dropdown into view whenever it is opened
    dropDownRef.current?.scrollIntoView({
      block: 'end',
      behavior: 'smooth',
    });
  }, [isOpen, dropDownRef.current?.offsetHeight]);

  return (
    <>
      {isOpen ? (
        <Box
          ref={dropDownRef}
          position={'absolute'}
          zIndex={1}
          px={'3'}
          py={'3'}
          borderRadius={'12'}
          borderWidth={'0.4px'}
          borderColor={'grey.100'}
          bg={'white.DEFAULT'}
          shadow={'0px 0px 4px rgba(0, 0, 0, 0.12)'}
          maxH={maxHeight}
          maxWidth={'102'}
          overflowY={'auto'}
          right={dropdownPosition === 'right' ? 0 : ''}
        >
          {children}
        </Box>
      ) : null}
    </>
  );
};

export default Dropdown;
