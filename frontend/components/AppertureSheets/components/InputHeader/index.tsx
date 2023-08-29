import FormulaDropDownBox from './FormulaDropDownBox';
import {
  BaseCellProps,
  CellChange,
  InputHeaderCell,
} from '@components/AppertureSheets/types/gridTypes';

// export interface InputHeaderCell extends Cell {
//   type: 'inputHeader';
//   text: string;
//   disable?: boolean;
//   showAddButton?: boolean;
//   addHeader?: boolean;
//   columnType?: SubHeaderColumnType;
//   properties: string[];
//   showSuggestions?: boolean;
//   disableAddButton?: boolean;
// }

// export class InputHeaderTemplate implements CellTemplate<InputHeaderCell> {
//   getCompatibleCell(
//     uncertainCell: Uncertain<InputHeaderCell>
//   ): Compatible<InputHeaderCell> {
//     const text = getCellProperty(uncertainCell, 'text', 'string');
//     const value = parseFloat(text);
//     let addHeader: boolean | undefined;
//     let properties: string[] | undefined;
//     try {
//       addHeader = getCellProperty(uncertainCell, 'addHeader', 'boolean');
//     } catch {
//       addHeader = false;
//     }
//     try {
//       properties = getCellProperty(uncertainCell, 'properties', 'object');
//     } catch {
//       properties = [];
//     }
//     return { ...uncertainCell, text, value, addHeader, properties };
//   }

//   update(
//     cell: Compatible<InputHeaderCell>,
//     cellToMerge: UncertainCompatible<InputHeaderCell>
//   ): Compatible<InputHeaderCell> {
//     return this.getCompatibleCell({
//       ...cell,
//       text: cellToMerge.text,
//       addHeader: cellToMerge.addHeader,
//     });
//   }

//   render(
//     cell: Compatible<InputHeaderCell>,
//     isInEditMode: boolean,
//     onCellChanged: (cell: Compatible<InputHeaderCell>, commit: boolean) => void
//   ): React.ReactNode {
//     return (
//       <FormulaDropDownBox
//         cell={cell}
//         onCellChanged={(updatedCell: any) =>
//           onCellChanged(
//             this.getCompatibleCell({ ...cell, ...updatedCell }),
//             true
//           )
//         }
//       />
//     );
//   }
// }

type InputHeaderCellProps = BaseCellProps & {
  cell: InputHeaderCell;
  onCellsChanged: (changedCell: CellChange<InputHeaderCell>[]) => void;
};

const InputHeaderCell = ({
  cell,
  onCellsChanged,
  ...props
}: InputHeaderCellProps) => {
  const { rowIndex, column } = props;

  return (
    <FormulaDropDownBox
      cell={cell}
      onCellChanged={(updatedCell: Partial<typeof cell>) => {
        const changedCell: CellChange<InputHeaderCell> = {
          rowId: rowIndex,
          columnId: column.columnId,
          type: cell.type,
          previousCell: {
            ...cell,
          },
          newCell: {
            ...cell,
            ...updatedCell,
          },
        };
        onCellsChanged([changedCell]);
      }}
    />
  );
};

export default InputHeaderCell;
