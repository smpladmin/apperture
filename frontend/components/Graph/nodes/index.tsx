import { IGroup, ModelConfig } from '@antv/g6';
import { nucleus, shadow, label, metric } from './shapes';

const primaryNode = (cfg: ModelConfig, group: IGroup, zoomRatio:number) => {
  const keyshape = nucleus(cfg, group);
  shadow(cfg, group,zoomRatio);
  label(cfg, group);
  metric(cfg, group);

  return keyshape;
};

export default primaryNode;
