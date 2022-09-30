import { Graph, IEdge, INode } from '@antv/g6';
import { graphConfig } from '@lib/config/graphConfig';
import { NodeType } from '@lib/types/graph';
import { edgesOnZoom, nodesOnZoom } from './zoomBehaviour';

export const setNodesAndEdgesStyleOnZoom = (
  nodes?: INode[],
  edges?: IEdge[],
  zoomRatio?: number
) => {
  nodesOnZoom(nodes, zoomRatio);
  edgesOnZoom(edges, zoomRatio);
};

export const removeNodesActiveState = (graph: Graph | null) => {
  graph?.findAllByState('node', 'active').forEach((node) => {
    graph?.setItemState(node, 'active', false);
  });
};

export const showAndHideNodesOnZoom = (
  graph: Graph | null,
  nodes: INode[],
  zoomRatio: number
) => {
  nodes.forEach((node) => {
    const model = node.getModel() as NodeType;
    const nodeVisibleAt = model?.visibleAt || graphConfig.minZoom;
    if (zoomRatio >= nodeVisibleAt) {
      graph?.showItem(node);
    } else {
      graph?.hideItem(node);
    }
  });
};
