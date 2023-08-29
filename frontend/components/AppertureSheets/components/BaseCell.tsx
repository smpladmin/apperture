import { Flex } from '@chakra-ui/react';
import React, { MouseEvent, ReactElement, useContext } from 'react';
import { Actions, GridContext } from '../context/GridContext';
import { BaseCellProps } from '../types/gridTypes';

type BaseCellPropsWithChildren = BaseCellProps & { children: ReactElement };

const BaseCell = ({ children, ...props }: BaseCellPropsWithChildren) => {
  const { column, rowIndex, columnIndex, style } = props;

  const { state, dispatch } = useContext(GridContext);
  const { currentCell, selectedColumns } = state;

  const columnId = column.columnId;
  const isCellSelected = selectedColumns.includes(columnId);

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

  return (
    <Flex
      className="base-cell"
      alignItems={'center'}
      w={60}
      height={6}
      borderRightWidth={isCellSelected ? '1px' : '0.4px'}
      borderLeftWidth={isCellSelected ? '1px' : '0'}
      backgroundColor={isCellSelected ? 'rgba(53,121,248,.35)' : 'transparent'}
      borderBottomWidth={'0.4px'}
      borderColor={
        isCellSelected || currentActiveCell ? 'blue.500' : 'grey.700'
      }
      fontSize={'xs-12'}
      borderWidth={currentActiveCell ? '2px' : ''}
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
