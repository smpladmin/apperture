import { INode } from '@antv/g6';
import { App } from '@lib/domain/app';
import { Node } from '@lib/domain/node';

export type InitialStateType = {
  nodesData: Array<INode>;
  activeNode: INode | null;
  isNodeSearched: boolean;
  nodes: Node[];
  activeApp: App | null;
};

export interface ContextType {
  state: InitialStateType;
  dispatch: React.Dispatch<any>;
}

export enum Actions {
  SET_NODES_DATA = 'SET_VISUALISATION_DATA',
  SET_ACTIVE_NODE = 'SET_ACTIVE_NODE',
  SET_IS_NODE_SEARCHED = 'SET_IS_NODE_SEARCHED',
  SET_NODES = 'SET_NODES',
  SET_ACTIVE_APP = 'SET_ACTIVE_APP',
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
      type: Actions.SET_NODES;
      payload: Node[];
    }
  | {
      type: Actions.SET_ACTIVE_APP;
      payload: App;
    };
