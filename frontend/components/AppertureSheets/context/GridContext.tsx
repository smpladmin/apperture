import { ReactElement, createContext, useReducer } from 'react';

type CurrentCell = {
  row: number;
  column: number;
};

type SelectedColumn = {
  columnId: string;
  columnIndex: number;
};

export type InitialStateType = {
  currentCell: CurrentCell;
  selectedColumns: SelectedColumn[];
  isCommandPressed: boolean;
  showEditableCell: boolean;
  editableCellStyle: React.CSSProperties;
  currentCellValue: string;
  isSheetActive: boolean;
  isHeaderCellInEditMode: boolean;
  highlightedColumns: Record<number, { color: string }>;
  headerFormulas: Record<number, string>;
};

export interface ContextType {
  state: InitialStateType;
  dispatch: React.Dispatch<any>;
}

export enum Actions {
  SET_CURRENT_CELL = 'SET_CURRENT_CELL',
  SET_SELECTED_COLUMNS = 'SET_SELECTED_COLUMNS',
  SET_IS_COMMAND_PRESSED = 'SET_IS_COMMAND_PRESSED',
  SET_SHOW_EDITABLE_CELL = 'SET_SHOW_EDITABLE',
  SET_EDITABLE_CELL_STYLE = 'SET_EDITABLE_CELL_STYLE',
  SET_CURRENT_CELL_VALUE = 'SET_CURRENT_CELL_VALUE',
  SET_SHEET_ACTIVE = 'SET_SHEET_ACTIVE',
  SET_HEADER_CELL_IN_EDIT_MODE = 'SET_HEADER_CELL_IN_EDIT_MODE',
  SET_HIGHLIGHTED_COLUMNS = 'SET_HIGHLIGHTED_COLUMNS',
  SET_HEADER_FORMULAS = 'SET_HEADER_FORMULAS',
}

export type GridActions =
  | {
      type: Actions.SET_CURRENT_CELL;
      payload: CurrentCell;
    }
  | {
      type: Actions.SET_SELECTED_COLUMNS;
      payload: SelectedColumn[];
    }
  | {
      type: Actions.SET_IS_COMMAND_PRESSED;
      payload: boolean;
    }
  | {
      type: Actions.SET_SHOW_EDITABLE_CELL;
      payload: boolean;
    }
  | {
      type: Actions.SET_EDITABLE_CELL_STYLE;
      payload: React.CSSProperties;
    }
  | {
      type: Actions.SET_CURRENT_CELL_VALUE;
      payload: string;
    }
  | {
      type: Actions.SET_HEADER_CELL_IN_EDIT_MODE;
      payload: boolean;
    }
  | {
      type: Actions.SET_HIGHLIGHTED_COLUMNS;
      payload: Record<number, { color: string }>;
    }
  | {
      type: Actions.SET_HEADER_FORMULAS;
      payload: string[];
    }
  | {
      type: Actions.SET_SHEET_ACTIVE;
      payload: boolean;
    };

const initialState: InitialStateType = {
  currentCell: { row: 0, column: 0 },
  selectedColumns: [],
  isCommandPressed: false,
  showEditableCell: false,
  editableCellStyle: {},
  currentCellValue: '',
  isSheetActive: true,
  isHeaderCellInEditMode: false,
  highlightedColumns: {},
  headerFormulas: {},
};

export const GridContext = createContext<ContextType>({
  state: initialState,
  dispatch: () => {},
});

const gridStateReducer = (state = initialState, action: GridActions) => {
  switch (action.type) {
    case Actions.SET_CURRENT_CELL: {
      return { ...state, currentCell: action.payload };
    }
    case Actions.SET_SELECTED_COLUMNS: {
      return { ...state, selectedColumns: action.payload };
    }
    case Actions.SET_IS_COMMAND_PRESSED: {
      return { ...state, isCommandPressed: action.payload };
    }
    case Actions.SET_SHOW_EDITABLE_CELL: {
      return { ...state, showEditableCell: action.payload };
    }
    case Actions.SET_EDITABLE_CELL_STYLE: {
      return { ...state, editableCellStyle: { ...action.payload } };
    }
    case Actions.SET_CURRENT_CELL_VALUE: {
      return { ...state, currentCellValue: action.payload };
    }
    case Actions.SET_SHEET_ACTIVE: {
      return { ...state, isSheetActive: action.payload };
    }
    case Actions.SET_HEADER_CELL_IN_EDIT_MODE: {
      return { ...state, isHeaderCellInEditMode: action.payload };
    }
    case Actions.SET_HEADER_CELL_IN_EDIT_MODE: {
      return { ...state, isHeaderCellInEditMode: action.payload };
    }
    case Actions.SET_HIGHLIGHTED_COLUMNS: {
      return { ...state, highlightedColumns: { ...action.payload } };
    }
    case Actions.SET_HEADER_FORMULAS: {
      return { ...state, headerFormulas: { ...action.payload } };
    }
    default:
      return state;
  }
};

const GridContextProvider = ({ children }: { children: ReactElement }) => {
  const [state, dispatch] = useReducer(gridStateReducer, initialState);

  return (
    <GridContext.Provider value={{ state, dispatch }}>
      {children}
    </GridContext.Provider>
  );
};

export default GridContextProvider;
