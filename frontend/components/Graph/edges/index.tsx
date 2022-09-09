import { basicLine, startLabel, endLabel } from './shapes';

const basicEdge = (cfg: any, group: any) => {
  const keyshape = basicLine(cfg, group);
  startLabel(cfg, group);
  if (cfg.node2Label) {
    endLabel(cfg, group);
  }
  group.sort();
  return keyshape;
};

export default basicEdge;
