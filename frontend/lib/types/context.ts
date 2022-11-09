import { INode, Item } from '@antv/g6';

export type InitialStateType = {
  nodesData: Array<INode>;
  activeNode: INode | null;
  isNodeSearched: boolean;
  edges: Array<any>;
};

export interface ContextType {
  state: InitialStateType;
  dispatch: React.Dispatch<any>;
}

export enum Actions {
  SET_NODES_DATA = 'SET_VISUALISATION_DATA',
  SET_ACTIVE_NODE = 'SET_ACTIVE_NODE',
  SET_IS_NODE_SEARCHED = 'SET_IS_NODE_SEARCHED',
  SET_EDGES = 'SET_EDGES',
}

export type LayoutActions =
  | {
      type: Actions.SET_NODES_DATA;
      payload: INode[];
    }
  | {
      type: Actions.SET_ACTIVE_NODE;
      payload: INode;
    }
  | {
      type: Actions.SET_IS_NODE_SEARCHED;
      payload: boolean;
    }
  | {
      type: Actions.SET_EDGES;
      payload: any;
    };
