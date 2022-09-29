import {
  ContextType,
  InitialStateType,
  LayoutActions,
  Actions,
} from '@lib/types/context';
import { createContext, ReactElement, useReducer } from 'react';

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
    case Actions.SET_VISUALISATION_DATA: {
      return { ...state, visualisationData: [...action.payload] };
    }
    case Actions.SET_ACTIVE_NODE: {
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
