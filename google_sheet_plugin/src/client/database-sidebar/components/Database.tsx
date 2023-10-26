import React, { useState } from 'react';
import MyQueries from './MyQueries';
import EditQuery from './EditQuery';
import { SheetQuery } from '../lib/types';

const Database = () => {
  const [showEditQuery, setShowEditQuery] = useState(false);
  const [selectedSheetQuery, setSelectedSheetQuery] =
    useState<SheetQuery | null>(null);
  const [isExistingQuerySelected, setIsExistingQuerySelected] = useState(false);
  return (
    <>
      {showEditQuery ? (
        <EditQuery
          setShowEditQuery={setShowEditQuery}
          selectedSheetQuery={selectedSheetQuery}
          isExistingQuerySelected={isExistingQuerySelected}
        />
      ) : (
        <MyQueries
          setShowEditQuery={setShowEditQuery}
          setIsExistingQuerySelected={setIsExistingQuerySelected}
          setSelectedSheetQuery={setSelectedSheetQuery}
        />
      )}
    </>
  );
};

export default Database;
