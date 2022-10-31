import {
  useEffect,
  useRef,
  useMemo,
  useContext,
  useState,
  useCallback,
} from 'react';
import { Graph as G6Graph, INode } from '@antv/g6';
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
import { AppertureContext } from '@lib/contexts/appertureContext';
import { setNodeActive } from './graphUtil';

type GraphProps = {
  visualisationData: Array<Edge>;
};

const Graph = ({ visualisationData }: GraphProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const gRef = useRef<{ graph: G6Graph | null }>({
    graph: null,
  });
  const [nodeTouched, setNodeTouched] = useState({ value: false });
  const [nodeDragged, setNodeDragged] = useState({ value: false });
  const [interactedNode, setInteractedNode] = useState<INode | null>(null);

  const router = useRouter();
  const { dsId } = router.query;

  const graphData = useMemo(() => transformData(visualisationData), [dsId]);
  const {
    state: { activeNode, isNodeSearched },
    dispatch,
  } = useContext(MapContext);
  const { device } = useContext(AppertureContext);

  const toggleNodeActiveState = (node: INode | null) => {
    let graph = gRef.current.graph;
    if (node) {
      if (node.hasState('active')) {
        graph?.setItemState(node, 'active', false);
        return;
      }
      setNodeActive(graph!!, node);
    }
  };

  useEffect(() => {
    toggleNodeActiveState(activeNode);
    handleActivatingNodeOnSearchAndClick(
      gRef.current.graph,
      activeNode,
      isNodeSearched
    );
  }, [activeNode, isNodeSearched]);

  const onActivateNode = useCallback(
    (node: INode | null) => {
      dispatch({
        type: Actions.SET_ACTIVE_NODE,
        payload: node,
      });
      // set isNodeSearched flag to false as node is getting active via click
      dispatch({
        type: Actions.SET_IS_NODE_SEARCHED,
        payload: false,
      });
    },
    [dispatch]
  );

  useEffect(() => {
    /**
     * Track whether a node was touched and dragged on mobile.
     * If a node is just touched and not dragged then we want to
     * activate it and open the drawer for that node.
     * The reason to implement it this way, specifically for mobile
     * can be found in the networkGraph.ts file.
     */
    if (!device.isMobile) return;
    if (nodeTouched.value && !nodeDragged.value && interactedNode) {
      onActivateNode(interactedNode);
      setInteractedNode(null);
      setNodeTouched({ value: false });
      setNodeDragged({ value: false });
    }
    if (nodeTouched.value && nodeDragged.value) {
      setInteractedNode(null);
    }
  }, [
    nodeDragged,
    interactedNode,
    onActivateNode,
    dispatch,
    nodeTouched,
    device.isMobile,
  ]);

  useEffect(() => {
    registerWheelZoomEvent(gRef);
    registerActivateNodeEvent(onActivateNode);
  }, [onActivateNode]);

  useEffect(() => {
    if (!gRef.current.graph) {
      gRef.current.graph = initGraph(
        ref,
        () => {
          setNodeTouched({ value: true });
          setNodeDragged({ value: false });
        },
        () => setNodeDragged({ value: true })
      );
    }

    let graph = gRef.current.graph;
    registerBeforeLayoutEvent(graph);
    registerDragNodeEndEvent(graph, device.isMobile, (node: INode) =>
      setInteractedNode(node)
    );

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
