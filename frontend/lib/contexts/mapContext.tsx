import {
  ContextType,
  InitialStateType,
  LayoutActions,
  Actions,
} from '@lib/types/context';
import { createContext, ReactElement, useReducer } from 'react';

const initialState: InitialStateType = {
  nodesData: [],
  activeNode: null,
  isNodeSearched: false,
  nodes: [],
  activeApp: null,
};

export const MapContext = createContext<ContextType>({
  state: initialState,
  dispatch: () => {},
});

const nodesDataReducer = (state = initialState, action: LayoutActions) => {
  switch (action.type) {
    case Actions.SET_NODES_DATA: {
      return { ...state, nodesData: [...action.payload] };
    }
    case Actions.SET_ACTIVE_NODE: {
      return { ...state, activeNode: action.payload };
    }
    case Actions.SET_IS_NODE_SEARCHED: {
      return { ...state, isNodeSearched: action.payload };
    }
    case Actions.SET_NODES: {
      return { ...state, nodes: action.payload };
    }
    default:
      return state;
  }
};

const MapContextProvider = ({ children }: { children: ReactElement }) => {
  const [state, dispatch] = useReducer(nodesDataReducer, initialState);

  return (
    <MapContext.Provider value={{ state, dispatch }}>
      {children}
    </MapContext.Provider>
  );
};

export default MapContextProvider;
