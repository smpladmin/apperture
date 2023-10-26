import { Box, Flex, Text } from '@chakra-ui/react';
import React, { useEffect, useMemo, useState } from 'react';
import QueryEditor from './Editor';
import ActiveCellCard from './ActiveCellCard';
import { serverFunctions } from '../../utils/serverFunctions';
import { ActiveCell, Connection, SheetQuery, Workbook } from '../lib/types';
import ListConnections from './ListConnections';

type EditQueryProps = {
  setShowEditQuery: React.Dispatch<React.SetStateAction<boolean>>;
  selectedSheetQuery: SheetQuery | null;
  isExistingQuerySelected: boolean;
};

const EditQuery = ({
  setShowEditQuery,
  selectedSheetQuery,
  isExistingQuerySelected,
}: EditQueryProps) => {
  const [showEditor, setShowEditor] = useState(false);
  const [activeCell, setActiveCell] = useState<ActiveCell>(
    selectedSheetQuery?.sheetReference || {
      sheetName: '',
      rowIndex: 0,
      columnIndex: 0,
    }
  );

  const [connections, setConnections] = useState<Connection[]>([]);
  const [workbooks, setWorkbooks] = useState<Workbook[]>([]);

  const apiKey = useMemo(() => {
    return localStorage.getItem('apiKey') || '';
  }, []);

  useEffect(() => {
    const fetchConnectionsAndSavedWorkbooks = async () => {
      const [connections, savedWorkbooks] = await Promise.all([
        serverFunctions.fetchConnections(apiKey),
        serverFunctions.getSavedWorkbooks(apiKey),
      ]);

      console.log({ savedWorkbooks });
      setConnections(connections);
      setWorkbooks(savedWorkbooks);
    };
    fetchConnectionsAndSavedWorkbooks();
  }, []);

  return (
    <Box>
      <Flex
        justifyContent={'space-between'}
        alignItems={'center'}
        px={'16px'}
        py={'8px'}
        borderBottom={'0.4px solid #DFDFDF'}
        bg={'#212121'}
        color={'#ffffff'}
      >
        <Flex gap={'4px'}>
          <i
            className="ph ph-caret-left"
            onClick={() => setShowEditQuery(false)}
            style={{ cursor: 'pointer' }}
          ></i>
          <Text fontSize={'12px'} fontWeight={'400'} lineHeight={'16px'}>
            Edit Query
          </Text>
        </Flex>
        <ListConnections connections={connections} />
      </Flex>

      {showEditor ? (
        <QueryEditor
          activeCell={activeCell}
          workbooks={workbooks}
          connections={connections}
          selectedSheetQuery={selectedSheetQuery}
          isExistingQuerySelected={isExistingQuerySelected}
        />
      ) : (
        <ActiveCellCard
          activeCell={activeCell}
          setActiveCell={setActiveCell}
          setShowEditor={setShowEditor}
        />
      )}
    </Box>
  );
};

export default EditQuery;
