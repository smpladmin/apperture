import { useContext, useState } from 'react';
import FormulaDropDownBox from './FormulaDropDownBox';
import {
  BaseCellProps,
  CellChange,
  InputHeaderCell,
} from '@components/AppertureSheets/types/gridTypes';
import { Box, Flex, Text } from '@chakra-ui/react';
import {
  Actions,
  GridContext,
} from '@components/AppertureSheets/context/GridContext';

type InputHeaderCellProps = BaseCellProps & {
  cell: InputHeaderCell;
  onCellsChanged: (changedCell: CellChange<InputHeaderCell>[]) => void;
  onColumnHighlight: (highlight: any) => void;
};

const InputHeaderCell = ({
  cell,
  onCellsChanged,
  onColumnHighlight,
  ...props
}: InputHeaderCellProps) => {
  const { rowIndex, column, columnIndex } = props;
  const { state, dispatch } = useContext(GridContext);

  const { currentCell, isHeaderCellInEditMode } = state;

  const isHeaderCellCurrentlyEdited =
    currentCell.row === rowIndex && currentCell.column === columnIndex;

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (e.detail === 2) {
      e.stopPropagation();
      dispatch({
        type: Actions.SET_HEADER_CELL_IN_EDIT_MODE,
        payload: true,
      });
    }
  };

  console.log('rerender');

  return (
    <>
      {isHeaderCellInEditMode && isHeaderCellCurrentlyEdited ? (
        <FormulaDropDownBox
          cell={cell}
          onColumnHighlight={onColumnHighlight}
          onCellChanged={(updatedCell: Partial<typeof cell>) => {
            const changedCell: CellChange<InputHeaderCell> = {
              rowId: rowIndex,
              columnId: column.columnId,
              columnIndex,
              type: cell.type,
              previousCell: {
                ...cell,
              },
              newCell: {
                ...cell,
                ...updatedCell,
              },
            };
            dispatch({
              type: Actions.SET_HEADER_CELL_IN_EDIT_MODE,
              payload: false,
            });
            onCellsChanged([changedCell]);
          }}
        />
      ) : (
        <Flex
          alignItems={'center'}
          w={'full'}
          h={'full'}
          onClick={handleDoubleClick}
          className="input-header-cell"
          px={'1'}
          fontSize={'xs-12'}
          lineHeight={'xs-12'}
          fontWeight={'700'}
        >
          {cell?.text?.[0] === '=' ? cell.text.slice(1) : cell.text}
        </Flex>
      )}
    </>
  );
};

export default InputHeaderCell;
