import { ApiDataType, EdgeType, NodeType } from '@lib/types/graph';
import { addVisibilityInfo } from './graphUtil';
import { zoomConfig } from '@lib/config/graphConfig';

type resultType = {
  edges: Array<EdgeType>;
  nodes: Array<NodeType>;
};

const isEntrance = (eventName: string) => {
  return eventName === 'Entrance';
};

export const transformData = (data: Array<ApiDataType>): resultType => {
  let entranceSum = 0;
  /*
   * Temporary fix to pick hits as users for Mixpanel,
   * because right now we are only using users metric on the frontend.
   * We should change to hits/users based on which metric is selected.
   */
  if (data.every((d) => !d.users)) {
    data = data.map((d) => ({ ...d, users: d.hits }));
  }

  const edges: Array<EdgeType> = [];
  const allEvents: Array<string> = [];
  const nodes: Array<NodeType> = [];

  data.forEach((d) => {
    const { currentEvent, previousEvent } = d || {};
    if (!allEvents.includes(currentEvent)) {
      allEvents.push(currentEvent);
      nodes.push({
        id: currentEvent || '/empty-event',
        label: currentEvent || 'empty event',
        type: 'primary',
        eventName: currentEvent || '/empty-event',
      });
    }

    if (!allEvents.includes(previousEvent)) {
      allEvents.push(previousEvent);
      nodes.push({
        id: previousEvent || '/empty-event',
        label: previousEvent || 'empty event',
        type: 'primary',
        eventName: previousEvent || '/empty-event',
      });
    }

    if (isEntrance(d.previousEvent!!)) {
      entranceSum = entranceSum + d.users!!;
    }
  });

  nodes.forEach((n: NodeType) => {
    n.totalViews = 0;
    data.forEach((d) => {
      if (n.eventName === (d.currentEvent || '/empty-event')) {
        const edge = {
          source: d.previousEvent,
          target: d.currentEvent,
          previousEvent: d.previousEvent || '/empty-event',
          currentEvent: d.currentEvent,
          type: 'primary-line',
          node1Label: d.users,
          traffic: d.users,
        };
        n.totalViews = (n.totalViews || 0) + d.users;
        edges.push(edge);
      }
    });
  });

  const entranceNodeIndex = nodes.findIndex((node: NodeType) =>
    isEntrance(node.eventName)
  );
  if (entranceNodeIndex !== -1) {
    nodes[entranceNodeIndex].totalViews = entranceSum;
  }

  const biDirectionalNodes: Array<string> = [];
  edges.forEach((e1) => {
    edges.forEach((e2) => {
      if (e1.source + e1.target === e2.target + e2.source) {
        if (
          !biDirectionalNodes.includes(
            e2.source + e2.target || e1.source + e1.target
          )
        ) {
          biDirectionalNodes.push(e1.source + e1.target);
          e1.node2Label = e2.node1Label;
          e2.isHiddenEdge = true;
        }
        e1.traffic = e1.node1Label + e2.node1Label;
      }
    });
  });

  const sortedNodes = nodes.sort((a: NodeType, b: NodeType) => {
    return b.totalViews!! - a.totalViews!!;
  });

  const sortedEdges = edges.sort((a: EdgeType, b: EdgeType) => {
    return b.traffic - a.traffic;
  });

  return {
    nodes: addVisibilityInfo(sortedNodes, zoomConfig, true),
    edges: addVisibilityInfo(sortedEdges, zoomConfig, false),
  };
};
