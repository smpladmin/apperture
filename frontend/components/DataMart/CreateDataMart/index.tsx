import { Box, Flex } from '@chakra-ui/react';
import { sql } from '@codemirror/lang-sql';
import Header from '@components/EventsLayout/ActionHeader';
import {
  DataMartMetaData,
  DataMartObj,
  DataMartTableData,
} from '@lib/domain/datamart';
import {
  computeDataMartQuery,
  saveDataMartTable,
  updateDataMartTable,
} from '@lib/services/dataMartService';
import ReactCodeMirror from '@uiw/react-codemirror';
import { cloneDeep } from 'lodash';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import DataMartTable from '../components/DataMartTable';

const DataMart = ({ savedDataMart }: { savedDataMart?: DataMartObj }) => {
  const router = useRouter();
  const { dsId, dataMartId } = router.query;

  const datasourceId = (dsId as string) || savedDataMart?.datasourceId;
  const [tableName, setTableName] = useState<string>(
    savedDataMart?.name || 'Untitled Table'
  );
  const [isSaveButtonDisabled, setSaveButtonDisabled] = useState(true);
  const [isQueryResponseLoading, setIsQueryResponseLoading] = useState(true);
  const [tableMetaData, setTableMetaData] = useState<DataMartMetaData>({
    name: tableName,
    query: savedDataMart?.query || '',
  });
  const [queryResult, setQueryResult] = useState<DataMartTableData>({
    data: [],
    headers: [],
  });

  const [isDataMartBeingEdited, setIsDataMartBeingEdited] =
    useState<boolean>(false);

  useEffect(() => {
    if (router.pathname.includes('edit')) setIsDataMartBeingEdited(true);
  }, []);

  const handleQueryChange = (query: string) => {
    const updatedTableMetaData = cloneDeep(tableMetaData);
    updatedTableMetaData.query = query;
    setTableMetaData(updatedTableMetaData);
    setSaveButtonDisabled(true);
  };

  const handleSaveAndUpdate = async () => {
    const { data, status } = isDataMartBeingEdited
      ? await updateDataMartTable(
          dataMartId as string,
          datasourceId!!,
          tableMetaData.query,
          tableName
        )
      : await saveDataMartTable(datasourceId!!, tableMetaData.query, tableName);
    setIsDataMartBeingEdited(true);
    if (status === 200) {
      router.push({
        pathname: '/analytics/datamart/edit/[dataMartId]',
        query: { dataMartId: data?._id || dataMartId, datasourceId },
      });
    } else {
      setSaveButtonDisabled(false);
    }
  };

  useEffect(() => {
    if (queryResult.data.length > 0) {
      setSaveButtonDisabled(false);
    } else {
      setSaveButtonDisabled(true);
    }
  }, [queryResult]);

  const fetchData = async () => {
    setIsQueryResponseLoading(true);
    const res = tableMetaData.query
      ? await computeDataMartQuery(datasourceId!!, tableMetaData.query, true)
      : { data: [], headers: [] };
    let queriedData = res?.data;
    const updatedQueryResult = cloneDeep(queryResult);
    updatedQueryResult.data = queriedData?.data || [];
    updatedQueryResult.headers = queriedData?.headers || [];
    setQueryResult(updatedQueryResult);
    setIsQueryResponseLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Flex direction={'column'} flexGrow={1}>
      <Header
        handleGoBack={
          isDataMartBeingEdited
            ? () => {
                router.push({
                  pathname: '/analytics/datamart/list/[dsId]',
                  query: { dsId: datasourceId },
                });
              }
            : () => router.back()
        }
        name={tableName}
        setName={setTableName}
        handleSave={handleSaveAndUpdate}
        isSaveButtonDisabled={isSaveButtonDisabled}
        isRunButtonPresent={true}
        handleRunButtonClick={fetchData}
        isSaved={isDataMartBeingEdited}
      />
      <Box p={4}>
        <ReactCodeMirror
          value={tableMetaData.query}
          height="300px"
          extensions={[sql()]}
          onChange={(value) => handleQueryChange(value)}
          style={{ fontSize: '16px' }}
        />
        <DataMartTable
          data={queryResult.data}
          headers={queryResult.headers}
          loader={isQueryResponseLoading}
        />
      </Box>
    </Flex>
  );
};

export default DataMart;
