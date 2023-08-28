import GridContextProvider from '@components/AppertureSheets/GridContext';
import Sheet from '@components/AppertureSheets';
import React from 'react';

const AppertureSheet = () => {
  return (
    <GridContextProvider>
      <Sheet />
    </GridContextProvider>
  );
};

export default AppertureSheet;
