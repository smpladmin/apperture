import { nodeShapes } from '@lib/config/graphConfig';
import { fittingString } from '@lib/utils/graph/';
import { formatDatalabel } from '@lib/utils/graph';
import { IGroup, ModelConfig } from '@antv/g6';

//TODO: create a utility for these sahpe selectors
const shadow = (cfg: ModelConfig, group: IGroup) => {
  const nodeLabel = group.find(
    (e: IGroup) => e.get('name') === nodeShapes.label
  );
  const nodeShadow = group.find(
    (e: IGroup) => e.get('name') === nodeShapes.shadow
  );
  const nucleus = group.find(
    (e: IGroup) => e.get('name') === nodeShapes.nucleus
  );

  const nodeLabelBbox = nodeLabel.getBBox();
  const nodeShadowBbox = nodeShadow.getBBox();
  const nucleusBBox = nucleus.getBBox();

  const keyShape = group.addShape('text', {
    attrs: {
      x: nucleusBBox.minX,
      y: nodeLabelBbox.maxY + 2,
      text: fittingString(
        formatDatalabel(parseFloat(cfg.totalViews as string)),
        86,
        12
      ),
      fontSize: 10,
      fill: '#0E0E19',
      lineHeight: 12,
      textBaseline: 'top',
    },
    name: nodeShapes.metric,
    draggable: true,
  });

  return keyShape;
};

export default shadow;
