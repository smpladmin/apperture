export const zoomConfig = [
  {
    ratio: 0.75,
    percentile: 100,
  },
  {
    ratio: 1,
    percentile: 75,
  },
  {
    ratio: 1.25,
    percentile: 60,
  },
  {
    ratio: 1.5,
    percentile: 50,
  },
  {
    ratio: 2,
    percentile: 30,
  },
  {
    ratio: 2.5,
    percentile: 10,
  },
  {
    ratio: 3,
    percentile: 0,
  },
];

export const graphConfig = {
  layout: 'fruchterman',
  linkDistance: 150,
  nodeSize: 56,
  nodeSpacing: 112,
  minZoom: 1,
  maxZoom: 3,
  labelLength: 20,
};

export const nodeShapes = {
  nucleus: 'node-nucleus',
  shadow: 'node-shadow',
  metric: 'node-metric',
  label: 'node-label',
};

export const edgeShapes = {
  basicLine: 'basic-line',
  startLabel: 'edge-start-label',
  endLabel: 'edge-end-label',
};

export const edgeArrow = {
  offset: 40,
};
