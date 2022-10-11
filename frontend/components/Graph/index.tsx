import { useEffect, useRef, useMemo, useContext } from 'react';
import { Graph as G6Graph, Item } from '@antv/g6';
import { transformData } from './transformData';
import { Edge } from '@lib/domain/edge';
import { useRouter } from 'next/router';
import { MapContext } from '@lib/contexts/mapContext';
import { Actions } from '@lib/types/context';
import {
  registerBeforeLayoutEvent,
  registerDragNodeEndEvent,
  initGraph,
  registerWheelZoomEvent,
  registerActivateNodeEvent,
  handleActivatingNodeOnSearchAndClick,
} from './networkGraph';
import { WHITE_100 } from '@theme/index';

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
    handleActivatingNodeOnSearchAndClick(
      gRef.current.graph,
      activeNode,
      isNodeSearched
    );
  }, [activeNode]);

  useEffect(() => {
    registerWheelZoomEvent(gRef);

    const onActivateNode = (item: Item) => {
      dispatch({
        type: Actions.SET_ACTIVE_NODE,
        payload: item,
      });
      // set isNodeSearched flag to false as node is getting active via click
      dispatch({
        type: Actions.SET_IS_NODE_SEARCHED,
        payload: false,
      });
    };
    registerActivateNodeEvent(gRef.current.graph, onActivateNode);
  }, []);

  useEffect(() => {
    if (!gRef.current.graph) {
      gRef.current.graph = initGraph(ref);
    }

    let graph = gRef.current.graph;
    registerBeforeLayoutEvent(graph);
    registerDragNodeEndEvent(graph);

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
      style={{ height: '100%', backgroundColor: WHITE_100 }}
    />
  );
};

export default Graph;
