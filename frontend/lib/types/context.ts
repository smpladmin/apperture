import { Item } from '@antv/g6';

export type InitialStateType = {
  nodesData: Array<Item>;
  activeNode: Item | null;
  isNodeSearched: boolean;
};

export interface ContextType {
  state: InitialStateType;
  dispatch: React.Dispatch<any>;
}

export enum Actions {
  SET_NODES_DATA = 'SET_VISUALISATION_DATA',
  SET_ACTIVE_NODE = 'SET_ACTIVE_NODE',
  SET_NODE_SEARCHED = 'SET_NODE_SEARCHED',
}

export type LayoutActions =
  | {
      type: Actions.SET_NODES_DATA;
      payload: Item[];
    }
  | {
      type: Actions.SET_ACTIVE_NODE;
      payload: Item;
    }
  | {
      type: Actions.SET_NODE_SEARCHED;
      payload: boolean;
    };
