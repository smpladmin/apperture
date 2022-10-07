import { ZoomConfigType } from '@lib/types/graph';
import G6, { Graph, IEdge, INode } from '@antv/g6';
import { graphConfig } from '@lib/config/graphConfig';
import { NodeType } from '@lib/types/graph';
import { edgesOnZoom, nodesOnZoom } from '@components/Graph/zoomBehaviour';

export const setNodesAndEdgesStyleOnZoom = (
  nodes?: INode[],
  edges?: IEdge[],
  zoomRatio?: number
) => {
  nodesOnZoom(nodes, zoomRatio);
  edgesOnZoom(edges, zoomRatio);
};

export const removeNodesActiveState = (graph: Graph | null) => {
  graph?.findAllByState('node', 'active').forEach((node) => {
    graph?.setItemState(node, 'active', false);
  });
};

export const showAndHideNodesOnZoom = (
  graph: Graph | null,
  nodes: INode[],
  zoomRatio: number
) => {
  nodes.forEach((node) => {
    const model = node.getModel() as NodeType;
    const nodeVisibleAt = model?.visibleAt || graphConfig.minZoom;
    if (zoomRatio >= nodeVisibleAt) {
      graph?.showItem(node);
    } else {
      graph?.hideItem(node);
    }
  });
};

export const fittingString = (
  str: string,
  maxWidth: number,
  fontSize: number
) => {
  let currentWidth = 0;
  let res = str.toString();
  const pattern = new RegExp('[\u4E00-\u9FA5]+'); // distinguish the Chinese charactors and letters
  str
    .toString()
    .split('')
    .forEach((letter: string, i: number) => {
      if (currentWidth > maxWidth) return;
      if (pattern.test(letter)) {
        // Chinese charactors
        currentWidth += fontSize;
      } else {
        // get the width of single letter according to the fontSize
        currentWidth += G6.Util.getLetterWidth(letter, fontSize);
      }
      if (currentWidth > maxWidth) {
        const nextLineStr = fittingString(str.substr(i), maxWidth, fontSize);
        res = `${str.substr(0, i)}\n${nextLineStr}`;
      }
    });
  return res;
};

type itemsType = Array<any>;
export const addVisibilityInfo = (
  items: itemsType,
  zoomConfig: ZoomConfigType,
  addVisibleAt: boolean
): itemsType => {
  const fItems = items.map((item, index) => {
    item.percentile = ((items.length - index) / items.length) * 100;

    if (addVisibleAt) {
      item.visibleAt = getVisibilityZoomRatio(item.percentile, zoomConfig);
    }
    return item;
  });

  return fItems;
};

export const getVisibilityZoomRatio = (
  percentile: number,
  zoomConfig: ZoomConfigType
): number => {
  const z = zoomConfig.find((z) => z.percentile <= percentile)!!;
  return z?.ratio;
};

export const formatDatalabel = (datalabel: number) => {
  if (datalabel > 999999) {
    return Math.round(datalabel / 100000) / 10 + 'Mn';
  } else if (datalabel > 999) {
    return Math.round(datalabel / 100) / 10 + 'K';
  } else {
    return datalabel + '';
  }
};

export const convertISODateToReadableDate = (isoDate: string) => {
  const date = new Date(isoDate);
  const month = date.toLocaleString('default', { month: 'short' });
  let day = date.getDate().toString();
  if (Number(day) < 10) {
    day = '0' + day;
  }

  return `${day}-${month}`;
};

export const getPercentageOfHits = (nodeHits: number, totalHits: number) => {
  // rounding off to 1 digit after decimal
  return Math.round((nodeHits / totalHits) * 1000) / 10;
};
