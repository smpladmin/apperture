import "../styles/globals.css";
import { AppLayoutProps } from 'next/app';
import { ReactNode } from "react";

function MyApp({ Component, pageProps }: AppLayoutProps) {
  const getLayout = Component.getLayout || ((page: ReactNode) => page)

  return getLayout(<Component {...pageProps} />)
}

export default MyApp;
