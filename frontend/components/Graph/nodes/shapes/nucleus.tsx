import { IGroup, ModelConfig } from '@antv/g6';
import { nodeShapes } from '@lib/config/graphConfig';
import { getNodeColor } from '../style';

const nucleus = (cfg: ModelConfig, group: IGroup) => {
  const { percentile } = cfg;
  const keyShape = group.addShape('circle', {
    attrs: {
      r: 6,
      fill: getNodeColor(percentile),
      fillOpacity: 1,
      zIndex: 5,
    },
    name: nodeShapes.nucleus,
    draggable: true,
  });

  return keyShape;
};

export default nucleus;
