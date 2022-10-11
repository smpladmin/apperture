import { focusItem } from './graphUtil';
import G6, {
  Graph as G6Graph,
  IG6GraphEvent,
  INode,
  IShape,
  Item,
} from '@antv/g6';
import { graphConfig } from '@lib/config/graphConfig';
import {
  getVisibilityZoomRatio,
  removeNodesActiveState,
  setActiveNodeStyle,
  setNodeActive,
  setNodesAndEdgesStyleOnZoom,
  showAndHideNodesOnZoom,
} from '@components/Graph/graphUtil';
import basicEdge from './edges';
import primaryNode from './nodes';
import { edgesOnZoom } from './zoomBehaviour';
import { MutableRefObject, RefObject } from 'react';
import { EDGE_ARROW_GRAY } from '@theme/index';

G6.registerNode(
  'primary',
  {
    draw(cfg, group) {
      const keyshape = primaryNode(cfg!!, group!!);
      return keyshape;
    },
    update: undefined,
  },
  'circle'
);

G6.registerEdge(
  'primary-line',
  {
    draw(cfg, group): IShape {
      const keyshape = basicEdge(cfg!!, group!!);
      return keyshape;
    },
    afterDraw(cfg, group): void {
      const edge = group?.get('children')[0];
      const startLabel = group?.get('children')[1];
      const length = edge.getTotalLength();
      edge.attr({
        endArrow: {
          path: G6.Arrow.triangleRect(
            2.5,
            1,
            0.5,
            2,
            0,
            length * 0.5 - length * 0.15
          ),
          fill: EDGE_ARROW_GRAY,
          stroke: 'transparent',
        },
      });
      if (cfg?.node2Label) {
        edge.attr({
          startArrow: {
            path: G6.Arrow.triangleRect(
              2.5,
              1,
              0.5,
              2,
              0,
              length * 0.5 - length * 0.15
            ),
            fill: EDGE_ARROW_GRAY,
            stroke: 'transparent',
          },
        });
      }
      if (cfg?.isHiddenEdge) {
        edge.destroy();
        startLabel.destroy();
      }
    },
    update: undefined,
  },
  'line'
);

export const initGraph = (ref: RefObject<HTMLDivElement>) =>
  new G6Graph({
    container: ref.current || '',
    width: ref.current?.offsetWidth,
    height: ref.current?.clientHeight,
    fitCenter: true,
    modes: {
      default: [
        'drag-canvas',
        'drag-node',
        'wheel-zoom',
        'activate-node',
        {
          type: 'zoom-canvas',
          sensitivity: graphConfig.zoomSensitivity,
          minZoom: graphConfig.minZoom,
          maxZoom: graphConfig.maxZoom,
        },
      ],
    },
    layout: {
      type: graphConfig.layout,
      center: [0, 0],
      linkDistance: graphConfig.linkDistance,
      preventOverlap: true,
      nodeSpacing: graphConfig.nodeSpacing,
      nodeSize: graphConfig.nodeSize,
    },
  });

export const registerBeforeLayoutEvent = (graph: G6Graph) => {
  graph.on('beforelayout', () => {
    const nodes = graph.getNodes();
    const zoomRatio = graph.getZoom();
    showAndHideNodesOnZoom(graph, nodes, zoomRatio);
  });
};

export const registerDragNodeEndEvent = (graph: G6Graph) => {
  graph.on('dragnodeend', (evt: IG6GraphEvent) => {
    const items = evt.items as Item[];
    const node = items[0] as INode;
    const edges = node.getEdges();
    const zoomRatio = graph.getZoom();
    setTimeout(() => {
      edgesOnZoom(edges, zoomRatio);
    }, 100);
  });
};

export const registerWheelZoomEvent = (
  gRef: MutableRefObject<{
    graph: G6Graph | null;
  }>
) => {
  G6.registerBehavior('wheel-zoom', {
    getEvents() {
      return {
        wheelzoom: 'onWheelZoom',
      };
    },
    onWheelZoom() {
      const graph = gRef.current.graph;
      const zoomRatio = graph?.getZoom()!!;
      const nodes = graph?.getNodes()!!;
      const edges = graph?.getEdges();

      if (zoomRatio >= graphConfig.minZoom) {
        showAndHideNodesOnZoom(graph, nodes, zoomRatio);
      }

      const activatedNodes = graph?.findAllByState('node', 'active');
      if (activatedNodes?.length) {
        setActiveNodeStyle(graph!!, activatedNodes[0], zoomRatio);
      }
      setNodesAndEdgesStyleOnZoom(nodes!!, edges!!, zoomRatio!!);
    },
  });
};

export const registerActivateNodeEvent = (
  graph: G6Graph | null,
  onActivateNode: Function
) => {
  G6.registerBehavior('activate-node', {
    getDefaultCfg() {
      return {
        multiple: false,
      };
    },
    getEvents() {
      return {
        'node:click': 'onNodeClick',
        'node:touchstart': 'onNodeClick',
      };
    },

    onNodeClick(e: IG6GraphEvent) {
      const item = e.item as Item;

      if (item.hasState('active')) {
        graph?.setItemState(item, 'active', false);
        return;
      }
      onActivateNode(item);
      setNodeActive(graph!!, item);
    },
  });
};

const _getNodeZoomRatio = (activeNode: Item) => {
  let zoomRatio = getVisibilityZoomRatio(
    (activeNode?._cfg?.model?.percentile as number)!!
  );
  if (zoomRatio < 1) zoomRatio = 1;
  return zoomRatio;
};

export const handleActivatingNodeOnSearchAndClick = (
  graph: G6Graph | null,
  activeNode: Item | null,
  isNodeSearched: boolean,
  isMobile: boolean
) => {
  const currentZoom = graph?.getZoom()!!;
  const nodes = graph?.getNodes();
  const edges = graph?.getEdges();

  if (!activeNode) {
    removeNodesActiveState(graph);
    setNodesAndEdgesStyleOnZoom(nodes, edges, currentZoom);
    return;
  }

  if (activeNode) {
    // remove active state of any node before making it active
    removeNodesActiveState(graph);
    setNodeActive(graph!!, activeNode);

    // find zoom ratio of active node by using percentile logic which is initially used for displaying node on zoom
    const zoomRatio = _getNodeZoomRatio(activeNode);
    setActiveNodeStyle(
      graph!!,
      activeNode,
      isNodeSearched && currentZoom < zoomRatio ? zoomRatio : currentZoom
    );

    if (isNodeSearched && currentZoom < zoomRatio) {
      graph?.zoomTo(zoomRatio);
      showAndHideNodesOnZoom(graph, nodes!!, zoomRatio);
      setNodesAndEdgesStyleOnZoom(nodes, edges, zoomRatio);
    } else {
      // normalise size of node as per current zoom
      // case:user clicks on node when graph is zoomed
      setNodesAndEdgesStyleOnZoom(nodes, edges, currentZoom);
    }
    if (!(isMobile && !isNodeSearched)) focusItem(graph!!, activeNode);
  }
};
