import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@chakra-ui/react';
import { Column } from './grid';

// export function addUserSelectStyles(doc) {
//   if (!doc) return;
//   let styleEl = doc.getElementById('react-draggable-style-el');
//   if (!styleEl) {
//     styleEl = doc.createElement('style');
//     styleEl.type = 'text/css';
//     styleEl.id = 'react-draggable-style-el';
//     styleEl.innerHTML =
//       '.react-draggable-transparent-selection *::-moz-selection {all: inherit;}\n';
//     styleEl.innerHTML +=
//       '.react-draggable-transparent-selection *::selection {all: inherit;}\n';
//     doc.getElementsByTagName('head')[0].appendChild(styleEl);
//   }
//   if (doc.body) addClassName(doc.body, 'react-draggable-transparent-selection');
// }

// export function removeUserSelectStyles(doc) {
//   if (!doc) return;
//   try {
//     if (doc.body)
//       removeClassName(doc.body, 'react-draggable-transparent-selection');
//     if (doc.selection) {
//       doc.selection.empty();
//     } else {
//       // Remove selection caused by scroll, unless it's a focused input
//       // (we use doc.defaultView in case we're in an iframe)
//       const selection = (doc.defaultView || window).getSelection();
//       if (selection && selection.type !== 'Caret') {
//         selection.removeAllRanges();
//       }
//     }
//   } catch (e) {
//     // probably IE
//   }
// }

const INVALID_VALUE = null;

const eventsFor = {
  touch: {
    start: 'touchstart',
    move: 'touchmove',
    stop: 'touchend',
  },
  mouse: {
    start: 'mousedown',
    move: 'mousemove',
    stop: 'mouseup',
  },
};

let dragEventFor = eventsFor.mouse;

interface ColumnResizerProps {
  style?: React.CSSProperties;
  column: Column; // Update with actual column type
  onResizeStart?: (column: any) => void; // Update with actual column type
  onResize?: Function; // Update with actual column type
  onResizeStop?: (column: any) => void; // Update with actual column type
  minWidth?: number;
}

function ColumnResizer(props: ColumnResizerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [lastX, setLastX] = useState<number | null>(INVALID_VALUE);
  const [width, setWidth] = useState(0);

  const handleRef = useRef<HTMLDivElement | null>(null);

  const {
    style,
    column,
    onResizeStart = () => {},
    onResize = () => {},
    onResizeStop = () => {},
    minWidth = 30,
    ...rest
  } = props;

  function handleDrag(e: MouseEvent | TouchEvent) {
    let clientX = (e as MouseEvent).clientX;
    if (e.type === eventsFor.touch.move) {
      e.preventDefault();
      if ((e as TouchEvent).targetTouches && (e as TouchEvent).targetTouches[0])
        clientX = (e as TouchEvent).targetTouches[0].clientX;
    }

    const offsetParent = handleRef?.current?.offsetParent;
    const offsetParentRect = offsetParent?.getBoundingClientRect();
    const x =
      clientX + (offsetParent?.scrollLeft || 0) - (offsetParentRect?.left || 0);

    if (lastX === INVALID_VALUE) {
      setLastX(x);
      return;
    }

    const { width, columnId } = column;
    const movedX = x - lastX!;
    if (!movedX) return;

    setWidth((prevWidth) => {
      const newWidth = prevWidth + movedX;
      const clampedWidth = Math.min(
        maxWidth || newWidth,
        Math.max(newWidth, minWidth || MIN_WIDTH)
      );
      setLastX(x);
      if (clampedWidth === prevWidth) return prevWidth;
      onResize(columnId, clampedWidth);
      return clampedWidth;
    });
  }

  function handleDragStop() {
    if (!isDragging) return;
    setIsDragging(false);
    onResizeStop(column);
    const ownerDocument = handleRef?.current?.ownerDocument;
    // removeUserSelectStyles(ownerDocument);
    ownerDocument?.removeEventListener('mousemove', handleDrag);
    ownerDocument?.removeEventListener('mouseup', handleDragStop);
  }

  useEffect(() => {
    if (isDragging) {
      const ownerDocument = handleRef.current?.ownerDocument;
      console.log(ownerDocument);
      // addUserSelectStyles(ownerDocument);
      document.addEventListener('mousemove', handleDrag);
      ownerDocument?.addEventListener('mouseup', handleDragStop);
    }

    return () => {
      if (handleRef.current) {
        const ownerDocument = handleRef.current?.ownerDocument;
        // ownerDocument.removeEventListener(dragEventFor.move, handleDrag);
        ownerDocument?.removeEventListener(dragEventFor.stop, handleDragStop);
        // removeUserSelectStyles(ownerDocument);
      }
    };
  }, [isDragging, column, minWidth, lastX, onResize, onResizeStop]);

  function handleDragStart(e: React.MouseEvent | React.TouchEvent) {
    if (
      e.nativeEvent instanceof MouseEvent &&
      typeof e.nativeEvent.button === 'number' &&
      e.nativeEvent.button !== 0
    )
      return;

    setIsDragging(true);
    setLastX(INVALID_VALUE);
    setWidth(column.width);
    onResizeStart(column);

    const ownerDocument = handleRef.current?.ownerDocument;
    // addUserSelectStyles(ownerDocument);
    ownerDocument?.addEventListener('mousemove', handleDrag);
    ownerDocument?.addEventListener('mouseup', handleDragStop);
  }

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
  }

  function handleMouseDown(e: React.MouseEvent) {
    dragEventFor = eventsFor.mouse;
    handleDragStart(e);
  }

  function handleMouseUp(e: React.MouseEvent) {
    dragEventFor = eventsFor.mouse;
    handleDragStop();
  }

  function handleTouchStart(e: React.TouchEvent) {
    dragEventFor = eventsFor.touch;
    handleDragStart(e);
  }

  function handleTouchEnd(e: React.TouchEvent) {
    dragEventFor = eventsFor.touch;
    handleDragStop();
  }

  return (
    // <div
    //   {...rest}
    //   ref={handleRef}
    //   onClick={handleClick}
    //   onMouseDown={handleMouseDown}
    //   onMouseUp={handleMouseUp}
    //   onTouchStart={handleTouchStart}
    //   onTouchEnd={handleTouchEnd}
    //   style={{
    //     userSelect: 'none',
    //     touchAction: 'none',
    //     position: 'absolute',
    //     top: 0,
    //     bottom: 0,
    //     right: 0,
    //     cursor: 'col-resize',
    //     ...style,
    //   }}
    // />
    <Box
      ref={handleRef}
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
}

ColumnResizer.defaultProps = {
  onResizeStart: () => {},
  onResize: () => {},
  onResizeStop: () => {},
  minWidth: 30,
};

export default ColumnResizer;
