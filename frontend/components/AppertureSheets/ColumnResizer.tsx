import { Box } from '@chakra-ui/react';
import React, { useRef } from 'react';
import { Column } from './grid';

const INVALID_VALUE = null;

const ColumnResizer = ({
  column,
  handleResize,
  maxWidth = 400,
  minWidth = 40,
}: {
  column: Column;
  handleResize: Function;
  maxWidth?: number;
  minWidth?: number;
}) => {
  const { columnId, width } = column;

  const dragRef = useRef<HTMLDivElement>(null);
  let isDragging = false;
  let lastX: null | number = INVALID_VALUE;
  let calculatedWidth: number = 0;

  const handleMouseDown = (e: any) => {
    const ownerDocument = dragRef?.current?.ownerDocument;
    isDragging = true;
    calculatedWidth = width;

    // if (ownerDocument) {
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', handleMouseUp);
    // }
  };

  const handleDrag = (e: any) => {
    // if (!isDragging) {
    //   return;
    // }
    e.preventDefault();
    let clientX = e.clientX;
    // if (e.type === eventsFor.touch.move) {
    //   e.preventDefault();
    //   if (e.targetTouches && e.targetTouches[0])
    //     clientX = e.targetTouches[0].clientX;
    // }

    const offsetParent = dragRef?.current?.offsetParent;
    const offsetParentRect = offsetParent?.getBoundingClientRect();
    const x =
      clientX + (offsetParent?.scrollLeft || 0) - (offsetParentRect?.left || 0);

    if (lastX === INVALID_VALUE) {
      lastX = x;
      return;
    }

    const movedX = x - lastX;
    if (!movedX) return;

    calculatedWidth = width + movedX;
    lastX = x;

    let newWidth = calculatedWidth;
    if (maxWidth && newWidth > maxWidth) {
      newWidth = maxWidth;
    } else if (newWidth < minWidth) {
      newWidth = minWidth;
    }

    if (newWidth === width) return;
    handleResize(columnId, newWidth);
  };

  const handleMouseUp = (e: any) => {
    if (!isDragging) return;
    isDragging = false;
    const ownerDocument = dragRef?.current?.ownerDocument;

    // if (ownerDocument) {
    document.removeEventListener('mousemove', handleDrag);
    document.removeEventListener('mouseup', handleMouseUp);
    // }
  };

  return (
    <Box
      ref={dragRef}
      position={'absolute'}
      top={0}
      right={0}
      width={'6px'}
      height={'100%'}
      _hover={{
        cursor: 'col-resize',
        bg: 'blue.500',
      }}
      sx={{
        userSelect: 'none',
        touchAction: 'none',
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    ></Box>
  );
};

export default ColumnResizer;
