import { useEffect, useRef, useMemo, useContext } from 'react';
import G6, {
  Graph as G6Graph,
  IG6GraphEvent,
  INode,
  IShape,
  Item,
} from '@antv/g6';
import { NodeType } from '@lib/types/graph';
import primaryNode from './nodes';
import basicEdge from './edges';
import { edgesOnZoom, nodesOnZoom } from './zoomBehaviour';
import { graphConfig } from '@lib/config/graphConfig';
import { transformData } from './transformData';
import { Edge } from '@lib/domain/edge';
import { useRouter } from 'next/router';
import { MapContext } from '@lib/contexts/mapContext';
import { Actions } from '@lib/types/context';

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
    state: { activeNode },
    dispatch,
  } = useContext(MapContext);

  useEffect(() => {
    let graph = gRef.current.graph;

    if (!activeNode) {
      graph?.findAllByState('node', 'active').forEach((node) => {
        graph?.setItemState(node, 'active', false);
      });
    }

    if (activeNode) {
      graph?.setItemState(activeNode, 'active', true);
    }

    const zoomRatio = graph?.getZoom();
    const nodes = graph?.getNodes();
    const edges = graph?.getEdges();
    nodesOnZoom(nodes, zoomRatio);
    edgesOnZoom(edges, zoomRatio);

    G6.registerBehavior('activate-node', {
      getDefaultCfg() {
        return {
          multiple: false,
        };
      },
      getEvents() {
        return {
          'node:click': 'onNodeClick',
        };
      },

      removeNodesState() {
        graph?.findAllByState('node', 'active').forEach((node) => {
          graph?.setItemState(node, 'active', false);
        });
      },

      onNodeClick(e: IG6GraphEvent) {
        const graph = gRef.current.graph;
        const item = e.item as Item;

        if (item.hasState('active')) {
          graph?.setItemState(item, 'active', false);
          return;
        }

        // Get the configurations by this. If you do not allow multiple nodes to be 'active', cancel the 'active' state for other nodes
        if (!this.multiple) {
          graph?.findAllByState('node', 'active').forEach((node) => {
            graph.setItemState(node, 'active', false);
          });
        }

        dispatch({
          type: Actions.SET_ACTIVE_NODE,
          payload: item,
        });
        // Set the 'active' state of the clicked node to be true
        graph?.setItemState(item, 'active', true);
      },
    });
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
          const zoomRatio = gRef.current.graph?.getZoom();
          const nodes = gRef.current.graph?.getNodes();
          const edges = gRef.current.graph?.getEdges();
          nodesOnZoom(nodes, zoomRatio);
          edgesOnZoom(edges, zoomRatio);
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
        nodeStateStyles: {
          active: {
            stroke: '#000000',
            fill: '#ffffff',
            opacity: 1,
            lineWidth: 8,
            r: 16,
            shadowColor: '#ffffff',
            shadowBlur: 6,
          },
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
      nodes.forEach((node) => {
        const model = node.getModel() as NodeType;
        const nodeVisibleAt = model?.visibleAt || graphConfig.minZoom;
        if (nodeVisibleAt > zoomRatio) {
          graph.hideItem(node);
        }
      });
    });

    graph.on('wheelzoom', () => {
      const nodes = graph.getNodes();
      const zoomRatio = graph.getZoom();

      if (zoomRatio >= graphConfig.minZoom) {
        nodes.forEach((node) => {
          const model = node.getModel() as NodeType;
          const nodeVisibleAt = model?.visibleAt || graphConfig.minZoom;
          if (zoomRatio >= nodeVisibleAt) {
            graph.showItem(node);
          } else {
            graph.hideItem(node);
          }
        });
      }
    });

    graph.on('dragnodeend', (evt: IG6GraphEvent) => {
      const items = evt.items as Item[];
      const zoomRatio = graph.getZoom();
      const node = items[0] as INode;
      const edges = node.getEdges();
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
      type: Actions.SET_VISUALISATION_DATA,
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
