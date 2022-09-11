import { useEffect, useRef } from 'react';
import G6, {
  Graph as G6Graph,
  IG6GraphEvent,
  INode,
  IShape,
  Item,
} from '@antv/g6';
import { ApiDataType, NodeType } from '@lib/types/graph';
import primaryNode from './nodes';
import basicEdge from './edges';
import { edgesOnZoom, nodesOnZoom } from './zoomBehaviour';
import { graphConfig } from '@lib/config/graphConfig';
import { transformData } from './transformData';

type GraphProps = {
  visualisationData: Array<ApiDataType>;
};

const Graph = ({ visualisationData }: GraphProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const gRef = useRef<{ graph: G6Graph | null }>({
    graph: null,
  });

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
                  4,
                  2,
                  2,
                  8,
                  0,
                  length * 0.5 - length * 0.15
                ),
                fill: '#6BBDDFCC',
                stroke: 'transparent',
              },
            });
            if (cfg?.node2Label) {
              edge.attr({
                startArrow: {
                  path: G6.Arrow.triangleRect(
                    4,
                    2,
                    2,
                    8,
                    0,
                    length * 0.5 - length * 0.15
                  ),
                  fill: '#6BBDDFCC',
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
        width: ref.current?.scrollWidth,
        height: ref.current?.scrollHeight || 800,
        fitCenter: true,
        modes: {
          default: [
            'drag-canvas',
            'drag-node',
            'wheel-zoom',
            {
              type: 'zoom-canvas',
              sensitivity: 0.5,
              minZoom: 1,
            },
          ],
        },
        layout: {
          type: graphConfig.layout,
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
        const nodeVisibleAt = model?.visibleAt || 0;
        if (nodeVisibleAt > zoomRatio) {
          graph.hideItem(node);
        }
      });
    });

    graph.on('wheelzoom', () => {
      const nodes = graph.getNodes();
      const zoomRatio = graph.getZoom();

      if (zoomRatio >= 1) {
        nodes.forEach((node) => {
          const model = node.getModel() as NodeType;
          const nodeVisibleAt = model?.visibleAt || 1;
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

    graph.data(transformData(visualisationData));
    graph.render();
  }, [visualisationData]);

  return <div id="network-graph" ref={ref}></div>;
};

export default Graph;
