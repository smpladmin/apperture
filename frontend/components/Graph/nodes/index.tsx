import { IGroup, ModelConfig } from '@antv/g6';
import { nucleus, shadow, label, metric } from './shapes';

const primaryNode = (cfg: ModelConfig, group: IGroup) => {
  const keyshape = nucleus(cfg, group);
  shadow(cfg, group);
  label(cfg, group);
  metric(cfg, group);

  return keyshape;
};

export default primaryNode;
