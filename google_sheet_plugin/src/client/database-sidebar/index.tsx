import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import Database from './components/Database';

const DatabaseSidebar = () => {
  return (
    <ChakraProvider>
      <Database />
    </ChakraProvider>
  );
};

export default DatabaseSidebar;
