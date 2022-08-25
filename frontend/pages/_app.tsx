import "../styles/globals.css";
import { AppLayoutProps } from 'next/app';
import { ReactNode } from "react";
import { ChakraProvider } from "@chakra-ui/react";

function MyApp({ Component, pageProps }: AppLayoutProps) {
  const getLayout = Component.getLayout || ((page: ReactNode) => page)

  return (
    <ChakraProvider>
      {getLayout(<Component {...pageProps} />)}
    </ChakraProvider>
  )
}

export default MyApp;
