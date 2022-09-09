import { nucleus, shadow, label, metric } from './shapes';

const primaryNode = (cfg: any, group: any) => {
  const keyshape = nucleus(cfg, group);
  shadow(cfg, group);
  label(cfg, group);
  metric(cfg, group);

  return keyshape;
};

export default primaryNode;
