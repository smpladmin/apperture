import { Box } from '@chakra-ui/react';
import React, { useRef } from 'react';
import { Column } from './Grid';

const ColumnResizer = ({
  column,
  handleResize,
  maxWidth = 800,
  minWidth = 40,
}: {
  column: Column;
  handleResize: (columnId: string, width: number) => void;
  maxWidth?: number;
  minWidth?: number;
}) => {
  const { columnId, width } = column;

  const dragRef = useRef<HTMLDivElement>(null);

  const lastX = useRef(0);
  const isDragging = useRef(false);
  const initialWidth = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;

    initialWidth.current = width;
    lastX.current = e.clientX;

    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleDrag = (e: MouseEvent) => {
    if (!isDragging.current) return;

    const offset = e.clientX - lastX.current;
    const newWidth = Math.min(
      maxWidth,
      Math.max(minWidth, initialWidth.current + offset)
    );

    handleResize(columnId, newWidth);
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (!isDragging.current) return;

    isDragging.current = false;
    document.removeEventListener('mousemove', handleDrag);
    document.removeEventListener('mouseup', handleMouseUp);
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
      onMouseDown={(e) => handleMouseDown(e)}
    />
  );
};

export default ColumnResizer;
