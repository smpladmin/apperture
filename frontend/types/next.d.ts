import type {
  NextComponentType,
  NextPageContext,
  NextLayoutComponentType,
} from 'next';
import type { AppProps } from 'next/app';

declare module 'next' {
  type NextLayoutComponentType<P = {}> = NextComponentType<
    NextPageContext,
    any,
    P
  > & {
    getLayout?: (page: ReactNode, isMobile: boolean) => ReactNode;
  };
}

declare module 'next/app' {
  type AppLayoutProps<P = {}> = AppProps & {
    Component: NextLayoutComponentType;
  };
}
