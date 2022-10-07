import { fittingString } from '@components/Graph/graphUtil';
import { nodeShapes, graphConfig } from '@lib/config/graphConfig';
import { IGroup, ModelConfig } from '@antv/g6';
import { BLACK_200 } from '@theme/index';
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
      text: fittingString(
        (cfg.label as string).length > graphConfig.labelLength
          ? (cfg.label as string).substring(0, graphConfig.labelLength) + '...'
          : (cfg.label as string),
        86,
        12
      ),
      fontSize: 14,
      fontWeight: 500,
      fill: BLACK_200,
      lineHeight: 11,
      textBaseline: 'top',
    },
    name: nodeShapes.label,
    draggable: true,
  });

  return keyShape;
};

export default label;
