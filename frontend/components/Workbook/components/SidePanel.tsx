import { Box, Flex } from '@chakra-ui/react';
import { GREY_500 } from '@theme/index';
import { ArrowLeft, ArrowRight, CaretLeft } from 'phosphor-react';
import React, { useEffect, useState } from 'react';
import Connections from './Connections';
import ConnectorColumns from './ConnectorColumns';
import {
  SheetChartDetail,
  SheetType,
  TransientSheetData,
} from '@lib/domain/workbook';
import { Connection, ConnectionSource } from '@lib/domain/connections';
import { useRouter } from 'next/router';
import { cloneDeep } from 'lodash';
import { findConnectionByDatasourceId } from '../util';
import { PivotTableSidePanel } from './PivotSidePanel';
import { ChartPanelState } from '..';
import ChartSidePanel from './ChartSidePanel';

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
  chartPanel: ChartPanelState;
  showChartPanel: (data: SheetChartDetail) => void;
  hideChartPanel: () => void;
  updateChart: (timestamp: number, updatedChartData: SheetChartDetail) => void;
  setIsSelectedConnectionDatamart: Function;
};

enum SidePanelStateType {
  CONNECTIONS = 'CONNECTIONS',
  PIVOT = 'PIVOT',
  CHART = 'CHART',
}

const calculateSidePanelState = (
  currentSheet: TransientSheetData
): SidePanelStateType => {
  if (currentSheet.sheet_type == SheetType.PIVOT_TABLE)
    return SidePanelStateType.PIVOT;
  return SidePanelStateType.CONNECTIONS;
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
  chartPanel,
  showChartPanel,
  hideChartPanel,
  updateChart,
  setIsSelectedConnectionDatamart,
}: SidePanelProps) => {
  const currentSheet = sheetsData[selectedSheetIndex];
  const [SidePanelState, setSidePanelState] = useState<SidePanelStateType>(
    calculateSidePanelState(currentSheet)
  );
  const [isSidePanelCollapsed, setIsSidePanelCollapsed] = useState(false);
  const [connectorData, setConnectorData] = useState<
    ConnectionSource & { heirarchy: string[] }
  >({
    id: '',
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
    setSidePanelState(calculateSidePanelState(sheetsData[selectedSheetIndex]));
  }, [selectedSheetIndex]);

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
      width={isSidePanelCollapsed ? '8' : '73'}
      minWidth={isSidePanelCollapsed ? '8' : '73'}
      h={'full'}
      background={'white.500'}
      pt={'4'}
      borderRightWidth={'0.4px'}
      borderColor={'grey.700'}
      overflowY={'auto'}
      pb={10}
      className={`side-panel${chartPanel.hidden ? '' : '-chart'}`}
    >
      {!isSidePanelCollapsed ? (
        <>
          {SidePanelState === SidePanelStateType.CONNECTIONS ? (
            chartPanel.hidden ? (
              <SheetConnections
                showColumns={showColumns}
                sheetsData={sheetsData}
                connectorData={connectorData}
                selectedSheetIndex={selectedSheetIndex}
                setShowColumns={setShowColumns}
                setSheetsData={setSheetsData}
                evaluateFormulaHeader={evaluateFormulaHeader}
                addDimensionColumn={addDimensionColumn}
                loadingConnections={loadingConnections}
                connections={connections}
                setConnectorData={setConnectorData}
                setShowSqlEditor={setShowSqlEditor}
                setIsSelectedConnectionDatamart={
                  setIsSelectedConnectionDatamart
                }
              />
            ) : (
              <ChartSidePanel
                data={chartPanel.data as SheetChartDetail}
                hideChartPanel={hideChartPanel}
                updateChart={updateChart}
              />
            )
          ) : null}
          {SidePanelState === SidePanelStateType.PIVOT ? (
            <PivotTableSidePanel
              setShowColumns={setShowColumns}
              setSheetsData={setSheetsData}
              selectedSheetIndex={selectedSheetIndex}
              sheetsData={sheetsData}
            />
          ) : null}
          {SidePanelState === SidePanelStateType.CHART ? (
            <PivotTableSidePanel
              setShowColumns={setShowColumns}
              setSheetsData={setSheetsData}
              selectedSheetIndex={selectedSheetIndex}
              sheetsData={sheetsData}
            />
          ) : null}
        </>
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

type SheetConnectionsProps = {
  showColumns: boolean;
  sheetsData: TransientSheetData[];
  connectorData: ConnectionSource & {
    heirarchy: string[];
  };
  selectedSheetIndex: number;
  setShowColumns: Function;
  setSheetsData: Function;
  evaluateFormulaHeader: Function;
  addDimensionColumn: Function;
  loadingConnections: boolean;
  connections: Connection[];
  setConnectorData: Function;
  setShowSqlEditor: Function;
  setIsSelectedConnectionDatamart: Function;
};

const SheetConnections = ({
  showColumns,
  sheetsData,
  connectorData,
  selectedSheetIndex,
  setShowColumns,
  setSheetsData,
  evaluateFormulaHeader,
  addDimensionColumn,
  loadingConnections,
  connections,
  setConnectorData,
  setShowSqlEditor,
  setIsSelectedConnectionDatamart,
}: SheetConnectionsProps) => {
  return (
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
          setIsSelectedConnectionDatamart={setIsSelectedConnectionDatamart}
        />
      )}
    </Flex>
  );
};

export default SidePanel;
