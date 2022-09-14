import { IEdge, IGroup } from '@antv/g6';
import { edgeShapes } from '@lib/config/graphConfig';

const edgesOnZoom = (edges?: IEdge[], zoomRatio: number = 1) => {
  edges?.forEach((edge: IEdge) => {
    const group = edge.getContainer();
    const model = edge.getModel();

    const edgeStartLabel = group.find(
      (e: IGroup) => e.get('name') === edgeShapes.startLabel
    );
    const edgeEndLabel = group.find(
      (e: IGroup) => e.get('name') === edgeShapes.endLabel
    );
    const edgeBasicLine = group.find(
      (e: IGroup) => e.get('name') === edgeShapes.basicLine
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
    
    if (edgeBasicLine) {
      edgeBasicLine.attr({
      lineWidth: ((9 * (edgeBasicLine.attrs.percentile  as number)) / 100) / zoomRatio ,
    });
    }
    

   
    


  });
};

export default edgesOnZoom;
