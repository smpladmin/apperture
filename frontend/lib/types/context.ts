import { Item } from '@antv/g6';

export type InitialStateType = {
  visualisationData: Array<Item>;
  activeNode: Item | null;
};

export interface ContextType {
  state: InitialStateType;
  dispatch: React.Dispatch<any>;
}

export enum Actions {
  SET_VISUALISATION_DATA = 'SET_VISUALISATION_DATA',
  SET_ACTIVE_NODE = 'SET_ACTIVE_NODE',
}

export type LayoutActions =
  | {
      type: Actions.SET_VISUALISATION_DATA;
      payload: Item[];
    }
  | {
      type: Actions.SET_ACTIVE_NODE;
      payload: Item;
    };
