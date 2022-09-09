import { IGroup, INode } from '@antv/g6';
import { nodeShapes } from '@lib/config/graphConfig';

const nodesOnZoom = (nodes: INode[], zoomRatio: number) => {
  nodes?.forEach((node: INode) => {
    const group = node.getContainer();
    const nodeMetric = group.find(
      (e: IGroup) => e.get('name') === nodeShapes.metric
    );
    const nodeLabel = group.find(
      (e: IGroup) => e.get('name') === nodeShapes.label
    );
    const nodeShadow = group.find(
      (e: IGroup) => e.get('name') === nodeShapes.shadow
    );
    nodeLabel.attr({
      fontSize: 12 / zoomRatio,
      lineHeight: 12 / zoomRatio,
    });

    const nodeLabelBbox = nodeLabel.getBBox();
    const nodeShadowBbox = nodeShadow.getBBox();
    nodeMetric.attr({
      fontSize: 10 / zoomRatio,
      lineHeight: 12 / zoomRatio,
      y:
        nodeShadowBbox.maxY > nodeLabelBbox.maxY
          ? nodeShadowBbox.maxY
          : nodeLabelBbox.maxY + 2,
    });
  });
};

export default nodesOnZoom;
