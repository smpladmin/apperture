import { IEdge } from '@antv/g6';
import { edgeShapes } from '@lib/config/graphConfig';

const edgesOnZoom = (edges: IEdge[], zoomRatio: number) => {
  edges.forEach((edge: any) => {
    const group = edge.getContainer();
    const model = edge.getModel();

    const edgeStartLabel = group.find(
      (e: any) => e.get('name') === edgeShapes.startLabel
    );
    const edgeEndLabel = group.find(
      (e: any) => e.get('name') === edgeShapes.endLabel
    );

    if (edgeEndLabel) {
      edgeEndLabel.attr({
        fontSize: 8 / zoomRatio + 2,
        lineHeight: 16 / zoomRatio,
      });
    }

    if (edgeStartLabel) {
      edgeStartLabel.attr({
        fontSize: 8 / zoomRatio + 2,
        lineHeight: 16 / zoomRatio,
      });
    }
  });
};

export default edgesOnZoom;
