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

  const defaultCellStyleProps = {
    borderRightWidth: '0.4px',
    borderLeftWidth: '0',
    borderBottomWidth: '0.4px',
    backgroundColor: 'transparent',
    borderColor: 'grey.700',
  };
  const activeCellStyleProps = {
    borderWidth: '2px',
    borderColor: 'blue.500',
  };

  const cellStyleProps = currentActiveCell
    ? activeCellStyleProps
    : defaultCellStyleProps;

  const selectedCellStyleProps = isCellSelected
    ? {
        borderColor: 'blue.500',
        backgroundColor: 'rgba(53,121,248,.35)',
        borderRightWidth: '1px',
        borderLeftWidth: '1px',
        borderBottomWidth: '0.4px',
      }
    : {};

  const highlightCellStyleProps = highlightColumn
    ? {
        borderLeftColor: highlightColor,
        borderRightColor: highlightColor,
        borderRightWidth: '2px',
        borderLeftWidth: '2px',
        borderLeftStyle: 'dashed',
        borderRightStyle: 'dashed',
      }
    : {};

  return (
    //@ts-ignore
    <Flex
      className="base-cell"
      alignItems={'center'}
      w={60}
      height={6}
      fontSize={'xs-12'}
      // borderRightWidth={isCellSelected ? '1px' : '0.4px'}
      // borderLeftWidth={isCellSelected && isLeftmostCellSelected ? '1px' : '0'}
      // borderBottomWidth={'0.4px'}
      // backgroundColor={isCellSelected ? 'rgba(53,121,248,.35)' : 'transparent'}
      // borderColor={
      //   isCellSelected || currentActiveCell ? 'blue.500' : 'grey.700'
      // }
      // borderWidth={currentActiveCell ? '2px' : ''}
      {...cellStyleProps}
      {...selectedCellStyleProps}
      {...highlightCellStyleProps}
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
