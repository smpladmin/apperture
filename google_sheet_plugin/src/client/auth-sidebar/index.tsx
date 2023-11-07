import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import Auth from './components/Auth';

const AuthSidebar = () => {
  return (
    <ChakraProvider>
      <Auth />
    </ChakraProvider>
  );
};

export default AuthSidebar;
