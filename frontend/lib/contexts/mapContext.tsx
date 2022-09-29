import { Item } from '@antv/g6';
import { createContext, ReactElement, useReducer } from 'react';

type InitialStateType = {
  visualisationData: Array<Item>;
  activeNode: Item | null;
};

interface ContextType {
  state: InitialStateType;
  dispatch: React.Dispatch<any>;
}

type LayoutActions =
  | {
      type: 'SET_VISUALISATION_DATA';
      payload: Item[];
    }
  | {
      type: 'SET_ACTIVE_NODE';
      payload: Item;
    };

const initialState: InitialStateType = {
  visualisationData: [],
  activeNode: null,
};

export const MapContext = createContext<ContextType>({
  state: initialState,
  dispatch: () => {},
});

const visualisationDataReducer = (
  state = initialState,
  action: LayoutActions
) => {
  switch (action.type) {
    case 'SET_VISUALISATION_DATA': {
      return { ...state, visualisationData: [...action.payload] };
    }
    case 'SET_ACTIVE_NODE': {
      return { ...state, activeNode: action.payload };
    }
    default:
      return state;
  }
};

const MapContextProvider = ({ children }: { children: ReactElement }) => {
  const [state, dispatch] = useReducer(visualisationDataReducer, initialState);

  return (
    <MapContext.Provider value={{ state, dispatch }}>
      {children}
    </MapContext.Provider>
  );
};

export default MapContextProvider;
