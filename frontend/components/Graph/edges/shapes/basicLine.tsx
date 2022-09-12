import { IGroup, ModelConfig } from '@antv/g6';
import { edgeShapes } from '@lib/config/graphConfig';

const basicLine = (cfg: ModelConfig, group: IGroup) => {
  const startPoint = cfg.startPoint;
  const endPoint = cfg.endPoint;

  const keyShape = group.addShape('path', {
    attrs: {
      lineWidth: (9 * (cfg.percentile as number)) / 100,
      stroke: '#E1E1E1',
      strokeOpacity: 1,
      path: [
        ['M', startPoint?.x, startPoint?.y],
        ['L', endPoint?.x, endPoint?.y],
      ],
      zIndex: 10,
    },
    name: edgeShapes.basicLine,
  });

  return keyShape;
};

export default basicLine;
