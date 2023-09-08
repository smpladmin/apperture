import { useState } from 'react';
import FormulaDropDownBox from './FormulaDropDownBox';
import {
  BaseCellProps,
  CellChange,
  InputHeaderCell,
} from '@components/AppertureSheets/types/gridTypes';
import { Box, Flex, Text } from '@chakra-ui/react';

type InputHeaderCellProps = BaseCellProps & {
  cell: InputHeaderCell;
  onCellsChanged: (changedCell: CellChange<InputHeaderCell>[]) => void;
};

const InputHeaderCell = ({
  cell,
  onCellsChanged,
  ...props
}: InputHeaderCellProps) => {
  const { rowIndex, column, columnIndex } = props;
  const [isInEditMode, setIsInEditMode] = useState(false);

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (e.detail === 2) {
      e.stopPropagation();
      setIsInEditMode(true);
    }
  };

  return (
    <>
      {isInEditMode ? (
        <FormulaDropDownBox
          cell={cell}
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
            setIsInEditMode(false);
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
