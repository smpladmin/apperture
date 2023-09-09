import { Flex } from '@chakra-ui/react';
import { useContext } from 'react';
import { Actions, GridContext } from '../context/GridContext';
import { BaseCellProps, CellChange, TextCell } from '../types/gridTypes';

type TextCellProps = BaseCellProps & {
  onCellsChanged: (changedCell: CellChange<TextCell>[]) => void;
  cell: TextCell;
};

const TextCell = ({ cell, ...props }: TextCellProps) => {
  const { dispatch } = useContext(GridContext);

  const handleDoubleClick = (
    event: React.MouseEvent,
    value: string | number
  ) => {
    const el = event.currentTarget?.parentElement;

    if (event.detail === 2) {
      if (el) {
        const position = el.getBoundingClientRect();

        const style = {
          left: position.x,
          top: position.y,
          minHeight: position.height,
          width: 'fit-content',
          maxWidth: `calc(100% - ${position.x + 20}px)`,
          minWidth: position.width,
        };

        dispatch({
          type: Actions.SET_EDITABLE_CELL_STYLE,
          payload: style,
        });
      }

      dispatch({
        type: Actions.SET_CURRENT_CELL_VALUE,
        payload: value,
      });
      dispatch({
        type: Actions.SET_SHOW_EDITABLE_CELL,
        payload: true,
      });
    }
  };
  const value = cell.text || '';

  return (
    <Flex
      w={'100%'}
      h={'100%'}
      px={1}
      onClick={(e) => handleDoubleClick(e, value)}
      dangerouslySetInnerHTML={{ __html: String(value) }}
      alignItems={'center'}
    />
  );
};

export default TextCell;
