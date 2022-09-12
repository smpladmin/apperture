import { ZoomConfigType } from '@lib/types/graph';

type itemsType = Array<any>;
export const addVisibilityInfo = (
  items: itemsType,
  zoomConfig: ZoomConfigType,
  addVisibleAt: boolean
): itemsType => {
  const fItems = items.map((item, index) => {
    item.percentile = ((items.length - index) / items.length) * 100;

    if (addVisibleAt) {
      item.visibleAt = getVisibilityZoomRatio(item.percentile, zoomConfig);
    }
    return item;
  });

  return fItems;
};

export const getVisibilityZoomRatio = (
  percentile: number,
  zoomConfig: ZoomConfigType
): number => {
  const z = zoomConfig.find((z) => z.percentile <= percentile)!!;
  return z.ratio;
};

export const formatDatalabel = (datalabel: number) => {
  if (datalabel > 999999) {
    return Math.round(datalabel / 100000) / 10 + 'Mn';
  } else if (datalabel > 999) {
    return Math.round(datalabel / 100) / 10 + 'K';
  } else {
    return datalabel + '';
  }
};
