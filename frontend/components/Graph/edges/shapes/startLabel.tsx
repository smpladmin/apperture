import { IGroup, ModelConfig } from '@antv/g6';
import { edgeShapes } from '@lib/config/graphConfig';
import { formatDatalabel } from '@lib/utils/graph';

const startLabel = (cfg: ModelConfig, group: IGroup) => {
  const shape = group.get('children')[0];
  const midPoint = shape.getPoint(0.3);

  const keyShape = group.addShape('text', {
    attrs: {
      lineHeight: 16,
      fontSize: 8,
      fill: '#521D7C',
      fillOpacity: 0.8,
      text: formatDatalabel(parseFloat(cfg.node1Label as string)),
      x: midPoint.x,
      y: midPoint.y,
      textBaseline: 'middle',
      zIndex: 12,
    },
    name: edgeShapes.startLabel,
  });

  return keyShape;
};

export default startLabel;
