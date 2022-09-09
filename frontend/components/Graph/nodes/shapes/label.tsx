import fittingString from '@lib/utils/graph/fittingString';
import { nodeShapes } from '@lib/config/graphConfig';
import { IGroup, ModelConfig } from '@antv/g6';
// TODO: Move colors to common congif file and use from there
const label = (cfg: ModelConfig, group: IGroup) => {
  const nucleus = group.find(
    (e: IGroup) => e.get('name') === nodeShapes.nucleus
  );
  const nucleusBBox = nucleus.getBBox();

  const keyShape = group.addShape('text', {
    attrs: {
      x: nucleusBBox.minX,
      y: nucleusBBox.maxY + 4,
      text: fittingString(cfg.label, 86, 12),
      fontSize: 12,
      fontWeight: 600,
      fill: '#0E0E19',
      lineHeight: 12,
      textBaseline: 'top',
    },
    name: nodeShapes.label,
    draggable: true,
  });

  return keyShape;
};

export default label;
