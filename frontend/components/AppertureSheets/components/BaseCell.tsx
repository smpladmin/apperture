import { Flex } from '@chakra-ui/react';
import React, { MouseEvent, ReactElement, useContext } from 'react';
import { Actions, GridContext } from '../context/GridContext';
import { BaseCellProps } from '../types/gridTypes';

type BaseCellPropsWithChildren = BaseCellProps & { children: ReactElement };

const BaseCell = ({ children, ...props }: BaseCellPropsWithChildren) => {
  const { column, rowIndex, columnIndex, style } = props;

  const { state, dispatch } = useContext(GridContext);
  const {
    currentCell,
    selectedColumns,
    isHeaderCellInEditMode,
    highlightedColumns,
  } = state;

  const columnId = column.columnId;
  const isCellSelected = selectedColumns.some(
    (selectedColumn) =>
      selectedColumn.columnId === columnId &&
      selectedColumn.columnIndex === columnIndex
  );
  const isLeftmostCellSelected =
    isCellSelected &&
    !selectedColumns.some(
      (selectedColumn) => selectedColumn.columnIndex === columnIndex - 1
    );

  const currentActiveCell =
    currentCell.row === rowIndex && currentCell.column === columnIndex;

  const handleClick = (event: MouseEvent) => {
    if (currentCell.column !== columnIndex || currentCell.row !== rowIndex) {
      dispatch({
        type: Actions.SET_CURRENT_CELL,
        payload: {
          column: columnIndex,
          row: rowIndex,
        },
      });
    }

    if (selectedColumns.length)
      dispatch({ type: Actions.SET_SELECTED_COLUMNS, payload: [] });
  };

  const highlightColumn =
    isHeaderCellInEditMode && highlightedColumns[columnIndex];
  const highlightColor = highlightedColumns[columnIndex]?.color;

  return (
    <Flex
      className="base-cell"
      alignItems={'center'}
      w={60}
      height={6}
      borderRightWidth={isCellSelected ? '1px' : '0.4px'}
      borderLeftWidth={isCellSelected && isLeftmostCellSelected ? '1px' : '0'}
      backgroundColor={
        highlightColumn
          ? highlightColor
          : isCellSelected
          ? 'rgba(53,121,248,.35)'
          : 'transparent'
      }
      borderBottomWidth={'0.4px'}
      borderColor={
        isCellSelected || currentActiveCell ? 'blue.500' : 'grey.700'
      }
      borderStyle={highlightColumn ? 'dashed' : 'solid'}
      fontSize={'xs-12'}
      textOverflow={'hidden'}
      overflow={'hidden'}
      whiteSpace={'nowrap'}
      style={style}
      onClick={handleClick}
    >
      {children}
    </Flex>
  );
};

export default BaseCell;
