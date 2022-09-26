import { IElement } from '@antv/g6';

declare module '@antv/g6' {
  type IElementWithAttr = IElement & {
    attr: any;
  };
}
