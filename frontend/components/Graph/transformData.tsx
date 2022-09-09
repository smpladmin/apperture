import { ApiDataType, EdgeType, NodeType } from '@lib/types/graph';
import { addVisibilityInfo } from '@lib/utils/graph';
import { zoomConfig } from '@lib/config/graphConfig';

type resultType = {
  edges: Array<EdgeType>;
  nodes: Array<NodeType>;
};

const isEntrance = (pagePath: string) => {
  return pagePath === 'Entrance';
};

export const transformData = (data: Array<ApiDataType>): resultType => {
  let entranceSum = 0;

  const edges: Array<EdgeType> = [];
  const allPages: Array<string> = [];
  const nodes: Array<NodeType> = [];

  data.forEach((d) => {
    const { pagePath, previousPage } = d || {};
    if (!allPages.includes(pagePath)) {
      allPages.push(pagePath);
      nodes.push({
        id: pagePath || '/empty-page',
        label: pagePath || 'empty page',
        type: 'primary',
        pageName: pagePath || '/empty-page',
      });
    }

    if (!allPages.includes(previousPage)) {
      allPages.push(previousPage);
      nodes.push({
        id: previousPage || '/empty-page',
        label: previousPage || 'empty page',
        type: 'primary',
        pageName: previousPage || '/empty-page',
      });
    }

    if (isEntrance(d.previousPage!!)) {
      entranceSum = entranceSum + d.users!!;
    }
  });

  nodes.forEach((n: NodeType) => {
    n.totalViews = 0;
    data.forEach((d) => {
      if (n.pageName === (d.pagePath || '/empty-page')) {
        const edge = {
          source: d.previousPage,
          target: d.pagePath,
          previousPage: d.previousPage || '/empty-page',
          pagePath: d.pagePath,
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
    isEntrance(node.pageName)
  );
  if (entranceNodeIndex !== -1) {
    nodes[entranceNodeIndex].totalViews = entranceSum;
  }

  // const biDirectionalNodes: Array<string> = [];
  // edges.forEach((e1) => {
  //   edges.forEach((e2) => {
  //     if (e1.source + e1.target === e2.target + e2.source) {
  //       if (
  //         !biDirectionalNodes.includes(
  //           e2.source + e2.target || e1.source + e1.target
  //         )
  //       ) {
  //         biDirectionalNodes.push(e1.source + e1.target);
  //         e1.node2Label = e2.node1Label;
  //         e2.isHiddenEdge = true;
  //       }
  //       e1.traffic = e1.node1Label + e2.node1Label;
  //     }
  //   });
  // });

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
