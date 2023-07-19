import { Box, Flex } from '@chakra-ui/react';
import { GREY_500 } from '@theme/index';
import { ArrowLeft, ArrowRight } from 'phosphor-react';
import React, { useState } from 'react';
import Connections from './Connections';
import ConnectorColumns from './ConnectorColumns';
import { TransientSheetData } from '@lib/domain/workbook';

type SidePanelProps = {
  connections: any;
  showColumns: boolean;
  sheetsData: TransientSheetData[];
  selectedSheetIndex: number;
  setShowEmptyState: Function;
  setSheetsData: Function;
  setShowSqlEditor: Function;
  setShowColumns: Function;
};

const SidePanel = ({
  connections,
  sheetsData,
  showColumns,
  setShowEmptyState,
  setSheetsData,
  selectedSheetIndex,
  setShowSqlEditor,
  setShowColumns,
}: SidePanelProps) => {
  const [isSidePanelCollapsed, setIsSidePanelCollapsed] = useState(false);
  const [connectorData, setConnectorData] = useState<any>({});

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
              sheetsData={sheetsData}
              connectorData={connectorData}
              selectedSheetIndex={selectedSheetIndex}
              setShowColumns={setShowColumns}
              setShowEmptyState={setShowEmptyState}
              setSheetsData={setSheetsData}
            />
          ) : (
            <Connections
              connections={connections}
              selectedSheetIndex={selectedSheetIndex}
              sheetsData={sheetsData}
              setSheetsData={setSheetsData}
              setConnectorData={setConnectorData}
              setShowColumns={setShowColumns}
              setShowSqlEditor={setShowSqlEditor}
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
