import { Box, Flex, Skeleton } from '@chakra-ui/react';
import { GREY_500 } from '@theme/index';
import { ArrowLeft, ArrowRight } from 'phosphor-react';
import React, { useEffect, useState } from 'react';
import Connections from './Connections';
import ConnectorColumns from './ConnectorColumns';
import { TransientSheetData } from '@lib/domain/workbook';
import { Connection, ConnectionSource } from '@lib/domain/connections';
import { useRouter } from 'next/router';
import { cloneDeep } from 'lodash';
import { findConnectionByDatasourceId } from '../util';

type SidePanelProps = {
  loadingConnections: boolean;
  connections: Connection[];
  showColumns: boolean;
  sheetsData: TransientSheetData[];
  selectedSheetIndex: number;
  setSheetsData: Function;
  setShowSqlEditor: Function;
  setShowColumns: Function;
  evaluateFormulaHeader: Function;
  addDimensionColumn: Function;
};

const SidePanel = ({
  loadingConnections,
  connections,
  sheetsData,
  showColumns,
  setSheetsData,
  selectedSheetIndex,
  setShowSqlEditor,
  setShowColumns,
  evaluateFormulaHeader,
  addDimensionColumn,
}: SidePanelProps) => {
  const [isSidePanelCollapsed, setIsSidePanelCollapsed] = useState(false);
  const [connectorData, setConnectorData] = useState<
    ConnectionSource & { heirarchy: string[] }
  >({
    name: '',
    fields: [],
    datasource_id: '',
    table_name: '',
    database_name: '',
    heirarchy: [],
  });

  const router = useRouter();
  const { dsId, selectProvider } = router.query;

  useEffect(() => {
    if (selectProvider && connections.length) {
      const connectionSource = findConnectionByDatasourceId(
        connections,
        dsId as string
      );

      setConnectorData({
        ...connectionSource,
        heirarchy: ['clickhouse', selectProvider as string],
      });
      setSheetsData((prevSheetData: TransientSheetData[]) => {
        const tempSheetData = cloneDeep(prevSheetData);
        tempSheetData[selectedSheetIndex].meta!!.dsId = dsId as string;
        return tempSheetData;
      });
      setShowColumns(true);
    }
  }, [connections]);

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
      pb={10}
    >
      {!isSidePanelCollapsed ? (
        <Flex direction={'column'} px={'2'} overflow={'auto'}>
          {showColumns ? (
            <ConnectorColumns
              sheetsData={sheetsData}
              connectorData={connectorData}
              selectedSheetIndex={selectedSheetIndex}
              setShowColumns={setShowColumns}
              setSheetsData={setSheetsData}
              evaluateFormulaHeader={evaluateFormulaHeader}
              addDimensionColumn={addDimensionColumn}
            />
          ) : (
            <Connections
              loadingConnections={loadingConnections}
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
