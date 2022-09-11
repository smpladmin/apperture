export const zoomConfig = [
  {
    ratio: 1,
    percentile: 100,
  },
  {
    ratio: 1.25,
    percentile: 70,
  },
  {
    ratio: 1.5,
    percentile: 50,
  },
  {
    ratio: 2,
    percentile: 20,
  },
  {
    ratio: 3,
    percentile: 10,
  },
  {
    ratio: 3.5,
    percentile: 0,
  },
];

export const graphConfig = {
  layout: 'gForce',
  linkDistance: 150,
  nodeSize: 56,
  nodeSpacing: 112,
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
