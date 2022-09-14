import { IGroup, ModelConfig } from '@antv/g6';
import { nodeShapes } from '@lib/config/graphConfig';
import { getShadowColor } from '../style';

const shadow = (cfg: ModelConfig, group: IGroup,zoomRatio:number) => {
  const { percentile } = cfg;
  const keyShape = group.addShape('circle', {
    attrs: {
      r: ((28 * (percentile as number)) / 100) *2,
      fill: getShadowColor(percentile),
      fillOpacity: 0.4,
      percentile:percentile,
    },
    name: nodeShapes.shadow,
    draggable: true,
  });

  return keyShape;
};

export default shadow;
