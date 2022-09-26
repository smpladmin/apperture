import { IElementWithAttr, IGroup, INode } from '@antv/g6';
import { nodeShapes } from '@lib/config/graphConfig';

const nodesOnZoom = (nodes?: INode[], zoomRatio: number = 1) => {
  nodes?.forEach((node: INode) => {
    const group = node.getContainer();
    const nodeMetric = group.find(
      (e: IGroup) => e.get('name') === nodeShapes.metric
    );
    const nodeLabel = group.find(
      (e: IGroup) => e.get('name') === nodeShapes.label
    );
    const nodeShadow: IElementWithAttr = group.find(
      (e: IGroup) => e.get('name') === nodeShapes.shadow
    );
    const nodeNucleus = group.find(
      (e: IGroup) => e.get('name') === nodeShapes.nucleus
    );

    const nodeLabelBbox = nodeLabel.getBBox();
    const nodeShadowBbox = nodeShadow.getBBox();
    const nucleusBBox = nodeNucleus.getBBox();

    nodeLabel.attr({
      fontSize: 12 / zoomRatio,
      lineHeight: 12 / zoomRatio,
      y: (nucleusBBox.maxY + 4) / zoomRatio,
    });
    nodeShadow.attr({
      r: (28 * (nodeShadow.attrs.percentile as number)) / 100 / (zoomRatio / 2),
    });

    nodeNucleus.attr({
      r: 8 / zoomRatio,
    });

    nodeMetric.attr({
      fontSize: 10 / zoomRatio,
      lineHeight: 12 / zoomRatio,
      y: (nodeLabelBbox.maxY  + 2),
    });
  });
};

export default nodesOnZoom;
