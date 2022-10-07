import { IGroup, ModelConfig } from '@antv/g6';
import { edgeShapes } from '@lib/config/graphConfig';
import { EDGE_GRAY } from '@theme/index';

const basicLine = (cfg: ModelConfig, group: IGroup) => {
  const startPoint = cfg.startPoint;
  const endPoint = cfg.endPoint;

  const keyShape = group.addShape('path', {
    attrs: {
      lineWidth: (9 * (cfg.percentile as number)) / 100,
      stroke: EDGE_GRAY,
      strokeOpacity: 0.75,
      path: [
        ['M', startPoint?.x, startPoint?.y],
        ['L', endPoint?.x, endPoint?.y],
      ],
      zIndex: 10,
      percentile: cfg.percentile,
      startPoint: cfg.startPoint,
      endPoint: cfg.endPoint,
    },
    name: edgeShapes.basicLine,
  });

  return keyShape;
};

export default basicLine;
