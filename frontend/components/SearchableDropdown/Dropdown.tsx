import { Box } from '@chakra-ui/react';
import React, { CSSProperties, ReactNode, useEffect, useRef } from 'react';

type DropdownProps = {
  isOpen: boolean;
  dropdownPosition?: 'right' | 'left';
  maxHeight?: number;
  children: ReactNode;
  minWidth?: string;
  top?: string;
  width?: string;
  style?: CSSProperties;
};

const Dropdown = ({
  isOpen,
  dropdownPosition,
  maxHeight = 102,
  children,
  minWidth,
  width,
  top,
  style,
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
          p={'2'}
          borderRadius={'12'}
          borderWidth={'1px'}
          borderColor={'white.200'}
          bg={'white.DEFAULT'}
          shadow={
            '-8px 52px 21px rgba(0, 0, 0, 0.01), -4px 30px 18px rgba(0, 0, 0, 0.03), -2px 13px 13px rgba(0, 0, 0, 0.05), 0px 3px 7px rgba(0, 0, 0, 0.06), 0px 0px 0px rgba(0, 0, 0, 0.06)'
          }
          maxH={maxHeight}
          maxWidth={'102'}
          width={width || 'auto'}
          overflowY={'auto'}
          right={dropdownPosition === 'right' ? 0 : ''}
          top={top || undefined}
          minWidth={minWidth || 'auto'}
          style={style}
        >
          {children}
        </Box>
      ) : null}
    </>
  );
};

export default Dropdown;
