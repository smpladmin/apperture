import { useEffect, useRef, useMemo, useContext } from 'react';
import G6, {
  Graph as G6Graph,
  IG6GraphEvent,
  INode,
  IShape,
  Item,
} from '@antv/g6';
import primaryNode from './nodes';
import basicEdge from './edges';
import { edgesOnZoom } from './zoomBehaviour';
import { graphConfig, zoomConfig } from '@lib/config/graphConfig';
import { transformData } from './transformData';
import { Edge } from '@lib/domain/edge';
import { useRouter } from 'next/router';
import { MapContext } from '@lib/contexts/mapContext';
import { Actions } from '@lib/types/context';
import {
  setNodesAndEdgesStyleOnZoom,
  showAndHideNodesOnZoom,
  removeNodesActiveState,
} from '@lib/utils/graph';

type GraphProps = {
  visualisationData: Array<Edge>;
};

const Graph = ({ visualisationData }: GraphProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const gRef = useRef<{ graph: G6Graph | null }>({
    graph: null,
  });

  const router = useRouter();
  const { dsId } = router.query;

  const graphData = useMemo(() => transformData(visualisationData), [dsId]);

  const {
    state: { activeNode, isNodeSearched },
    dispatch,
  } = useContext(MapContext);

  useEffect(() => {
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
        const graph = gRef.current.graph;
        const item = e.item as Item;

        if (item.hasState('active')) {
          graph?.setItemState(item, 'active', false);
          return;
        }

        dispatch({
          type: Actions.SET_ACTIVE_NODE,
          payload: item,
        });

        // set isNodeSearched flag to false as node is getting active via click
        dispatch({
          type: Actions.SET_IS_NODE_SEARCHED,
          payload: false,
        });
        // Set the 'active' state of the clicked node to be true
        graph?.setItemState(item, 'active', true);
      },
    });
  }, [activeNode]);

  useEffect(() => {
    let graph = gRef.current.graph;
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

      // set node state to active
      graph?.setItemState(activeNode, 'active', true);

      // find zoom ratio of active node by using percentile logic which is initially used for displaying node on zoom
      let zoomRatio = zoomConfig.find(
        (z) => z.percentile <= (activeNode?._cfg?.model?.percentile as number)!!
      )?.ratio!!;

      if (zoomRatio < 1) {
        zoomRatio = 1;
      }

      // add custom styles for node's active state
      // lineWidth depends on if users makes node active via click or via search
      graph?.updateItem(activeNode, {
        stateStyles: {
          active: {
            stroke: '#000000',
            fill: '#ffffff',
            lineWidth:
              6 /
              (isNodeSearched && currentZoom < zoomRatio
                ? zoomRatio
                : currentZoom),
            shadowColor: '#ffffff',
            shadowBlur: 6,
          },
        },
      });

      if (isNodeSearched && currentZoom < zoomRatio) {
        graph?.zoomTo(zoomRatio);
        showAndHideNodesOnZoom(graph, nodes!!, zoomRatio);
        setNodesAndEdgesStyleOnZoom(nodes, edges, zoomRatio);
      } else {
        // normalise size of node as per current zoom
        // case:user clicks on node when graph is zoomed
        setNodesAndEdgesStyleOnZoom(nodes, edges, currentZoom);
      }

      // focus on active node and move it to center of graph canvas
      graph?.focusItem(activeNode, true, {
        duration: 100,
      });
    }
  }, [activeNode]);

  useEffect(() => {
    if (!gRef.current.graph) {
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
                fill: '#a9a9aa',
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
                  fill: '#a9a9aa',
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

      G6.registerBehavior('wheel-zoom', {
        getEvents() {
          return {
            wheelzoom: 'onWheelZoom',
          };
        },
        onWheelZoom() {
          const graph = gRef.current.graph;
          const zoomRatio = graph?.getZoom();
          const nodes = graph?.getNodes();
          const edges = graph?.getEdges();
          setNodesAndEdgesStyleOnZoom(nodes!!, edges!!, zoomRatio!!);
        },
      });

      gRef.current.graph = new G6Graph({
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
              sensitivity: 0.5,
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
    }

    let graph = gRef.current.graph;

    graph.on('beforelayout', () => {
      const nodes = graph.getNodes();
      const zoomRatio = graph.getZoom();
      showAndHideNodesOnZoom(graph, nodes, zoomRatio);
    });

    graph.on('wheelzoom', () => {
      const nodes = graph.getNodes();
      const zoomRatio = graph.getZoom();
      if (zoomRatio >= graphConfig.minZoom) {
        showAndHideNodesOnZoom(graph, nodes, zoomRatio);
      }
    });

    graph.on('dragnodeend', (evt: IG6GraphEvent) => {
      const items = evt.items as Item[];
      const node = items[0] as INode;
      const edges = node.getEdges();
      const zoomRatio = graph.getZoom();
      setTimeout(() => {
        edgesOnZoom(edges, zoomRatio);
      }, 100);
    });

    graph.data(graphData);
    graph.render();
  }, [graphData]);

  useEffect(() => {
    let graph = gRef.current.graph;
    dispatch({
      type: Actions.SET_NODES_DATA,
      payload: graph?.getNodes(),
    });
  }, [dsId]);

  return (
    <div
      id="network-graph"
      ref={ref}
      style={{ height: '100%', backgroundColor: '#F6F6F6' }}
    ></div>
  );
};

export default Graph;
