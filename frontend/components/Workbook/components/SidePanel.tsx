import { Box, Flex } from '@chakra-ui/react';
import { GREY_500 } from '@theme/index';
import { ArrowLeft, ArrowRight } from 'phosphor-react';
import React, { useState } from 'react';
import Connections from './Connections';
import ConnectorColumns from './ConnectorColumns';
import { TransientSheetData } from '@lib/domain/workbook';

type SidePanelProps = {
  connections: any;
  sheetsData: TransientSheetData[];
  selectedSheetIndex: number;
  setShowEmptyState: Function;
  setSheetsData: Function;
  setShowSqlEditor: Function;
};

const SidePanel = ({
  connections,
  sheetsData,
  setShowEmptyState,
  setSheetsData,
  selectedSheetIndex,
  setShowSqlEditor,
}: SidePanelProps) => {
  const [isSidePanelCollapsed, setIsSidePanelCollapsed] = useState(false);
  const [showColumns, setShowColumns] = useState(false);
  const [connectorData, setConnectorData] = useState<any>({});
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [lastConnectionSelected, setLastConnectionSelected] = useState('');

  return (
    <Box
      width={isSidePanelCollapsed ? '8' : '62'}
      minWidth={isSidePanelCollapsed ? '8' : '62'}
      h={'full'}
      background={'white.500'}
      pt={'4'}
      borderRightWidth={'0.4px'}
      borderColor={'grey.700'}
      overflowY={'auto'}
    >
      {!isSidePanelCollapsed ? (
        <Flex direction={'column'} px={'2'} overflow={'auto'}>
          {showColumns ? (
            <ConnectorColumns
              connectorData={connectorData}
              selectedSheetIndex={selectedSheetIndex}
              setShowColumns={setShowColumns}
              setShowEmptyState={setShowEmptyState}
              setSheetsData={setSheetsData}
              selectedColumns={selectedColumns}
              setSelectedColumns={setSelectedColumns}
            />
          ) : (
            <Connections
              connections={connections}
              setConnectorData={setConnectorData}
              setShowColumns={setShowColumns}
              setShowSqlEditor={setShowSqlEditor}
              selectedColumns={selectedColumns}
              setSelectedColumns={setSelectedColumns}
              lastConnectionSelected={lastConnectionSelected}
              setLastConnectionSelected={setLastConnectionSelected}
            />
          )}
        </Flex>
      ) : null}

      <Box
        position={'fixed'}
        bottom={'0'}
        h={'8'}
        borderTopWidth={'0.4px'}
        borderColor={'grey.700'}
        pr={'2'}
        width={'inherit'}
        zIndex={'99'}
        background={'white.500'}
        borderRightWidth={'0.4px'}
      >
        <Flex
          cursor={'pointer'}
          h={'full'}
          justifyContent={'flex-end'}
          alignItems={'center'}
        >
          {isSidePanelCollapsed ? (
            <ArrowRight
              color={GREY_500}
              onClick={() => setIsSidePanelCollapsed((prevState) => !prevState)}
            />
          ) : (
            <ArrowLeft
              color={GREY_500}
              onClick={() => setIsSidePanelCollapsed((prevState) => !prevState)}
            />
          )}
        </Flex>
      </Box>
    </Box>
  );
};

export default SidePanel;
