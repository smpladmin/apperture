import { IGroup, ModelConfig } from '@antv/g6';
import { edgeShapes } from '@lib/config/graphConfig';
import { formatDatalabel } from '@components/Graph/graphUtil';

const endLabel = (cfg: ModelConfig, group: IGroup) => {
  const shape = group.get('children')[0];
  const midPoint = shape.getPoint(0.75);

  const keyShape = group.addShape('text', {
    attrs: {
      lineHeight: 16,
      fontSize: 8,
      fill: '#808080',
      fillOpacity: 0.8,
      text: formatDatalabel(parseFloat(cfg.node2Label as string)),
      x: midPoint.x,
      y: midPoint.y,
      textBaseline: 'middle',
      zIndex: 11,
    },
    name: edgeShapes.endLabel,
  });

  return keyShape;
};

export default endLabel;
