import { EdgeType, NodeType } from '@lib/types/graph';
import { createContext, ReactElement, useReducer } from 'react';

type State = {
  visualisationData: Array<any>;
  selectedNode: Array<any>;
};

interface ContextType {
  state: State;
  dispatch: React.Dispatch<any>;
}

type LayoutActions = {
  type: 'SET_VISUALISATION_DATA';
  payload: { [key in string]: Array<EdgeType & NodeType> };
};

const initialState: State = {
  visualisationData: [],
  selectedNode: [],
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
      return { ...state, visualisationData: [action.payload] };
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
