import {
  WHITE_DEFAULT,
  WHITE_300,
  NUCLEUS_TEAL,
  SHADOW_TEAL,
} from '@theme/index';

const shadowStartColor = SHADOW_TEAL;
const shadowEndColor = WHITE_300;
const nodeStartColor = NUCLEUS_TEAL;
const nodeEndColor = WHITE_DEFAULT;

export var getShadowColor = function (percentile: any) {
  var R1 = parseInt(shadowStartColor.substring(1, 3), 16);
  var G1 = parseInt(shadowStartColor.substring(3, 5), 16);
  var B1 = parseInt(shadowStartColor.substring(5, 7), 16);

  var R2 = parseInt(shadowEndColor.substring(1, 3), 16);
  var G2 = parseInt(shadowEndColor.substring(3, 5), 16);
  var B2 = parseInt(shadowEndColor.substring(5, 7), 16);

  var Rx = Math.round(R2 + (percentile * (R1 - R2)) / 100);
  var Gx = Math.round(G2 + (percentile * (G1 - G2)) / 100);
  var Bx = Math.round(B2 + (percentile * (B1 - B2)) / 100);

  return '#' + Rx.toString(16) + Gx.toString(16) + Bx.toString(16);
};

export var getNodeColor = function (percentile: any) {
  var R1 = parseInt(nodeStartColor.substring(1, 3), 16);
  var G1 = parseInt(nodeStartColor.substring(3, 5), 16);
  var B1 = parseInt(nodeStartColor.substring(5, 7), 16);

  var R2 = parseInt(nodeEndColor.substring(1, 3), 16);
  var G2 = parseInt(nodeEndColor.substring(3, 5), 16);
  var B2 = parseInt(nodeEndColor.substring(5, 7), 16);

  var Rx = Math.round(R2 + (percentile * (R1 - R2)) / 100);
  var Gx = Math.round(G2 + (percentile * (G1 - G2)) / 100);
  var Bx = Math.round(B2 + (percentile * (B1 - B2)) / 100);

  return '#' + Rx.toString(16) + Gx.toString(16) + Bx.toString(16);
};
