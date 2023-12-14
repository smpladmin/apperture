import { Flex, useDisclosure, useToast } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import ScriptHeader from './components/Header';
import SidePanel from './components/SidePanel';
import { useRouter } from 'next/router';
import QueryEditor from './components/QueryEditor';
import DataMartTable from './components/DataTable';
import ActionDrawer from './components/ActionDrawer';
import { DataMartObj, DataMartTableData } from '@lib/domain/datamart';
import {
  computeDataMartQuery,
  saveDataMartTable,
  updateDataMartTable,
} from '@lib/services/dataMartService';
import { ErrorResponse } from '@lib/services/util';

const Scripts = ({ savedDataMart }: { savedDataMart?: DataMartObj }) => {
  const [isQueryResponseLoading, setIsQueryResponseLoading] = useState(true);
  const [name, setName] = useState<string>(
    savedDataMart?.name || 'Untitled Table'
  );

  const [query, setQuery] = useState(savedDataMart?.query || '');
  const [queryResult, setQueryResult] = useState<DataMartTableData>({
    data: [],
    headers: [],
  });
  const [isSaveButtonDisabled, setSaveButtonDisabled] = useState(true);
  const [error, setError] = useState('');
  const [isDataMartBeingEdited, setIsDataMartBeingEdited] =
    useState<boolean>(false);

  const toast = useToast();
  const router = useRouter();
  const { dsId, dataMartId } = router.query;
  const datasourceId = (dsId as string) || savedDataMart?.datasourceId;
  const [savedDatamrtId, setDatamartId] = useState(
    (dataMartId as string) || ''
  );

  const { isOpen, onOpen, onClose } = useDisclosure();

  const openActionDrawer = () => {
    onOpen();
  };

  const fetchData = async () => {
    setIsQueryResponseLoading(true);
    const res = await computeDataMartQuery(datasourceId!!, query, true);
    if (res.status === 200) {
      let queriedData = res?.data;
      setQueryResult({
        data: queriedData?.data,
        headers: queriedData?.headers,
      });
      setSaveButtonDisabled(false);
    } else {
      setError((res as ErrorResponse)?.error?.detail);
    }
    setIsQueryResponseLoading(false);
  };

  useEffect(() => {
    if (router.pathname.includes('edit')) setIsDataMartBeingEdited(true);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveAndUpdate = async () => {
    setSaveButtonDisabled(true);
    const response = isDataMartBeingEdited
      ? await updateDataMartTable(savedDatamrtId, datasourceId!!, query, name)
      : await saveDataMartTable(datasourceId!!, query, name);
    if (response.status === 200) {
      router.push({
        pathname: '/analytics/datamart/edit/[dataMartId]',
        query: { dataMartId: response.data?._id || dataMartId, datasourceId },
      });
      setDatamartId(response.data?._id);
    } else {
      toast({
        title: (response as ErrorResponse)?.error?.detail,
        status: 'error',
        variant: 'subtle',
        isClosable: true,
      });
      setSaveButtonDisabled(false);
    }
  };

  return (
    <>
      <Flex direction={'column'}>
        <ScriptHeader
          name={name}
          setName={setName}
          isSaveButtonDisabled={isSaveButtonDisabled}
          handleSave={handleSaveAndUpdate}
          openActionDrawer={openActionDrawer}
        />
      </Flex>
      <Flex direction={'row'} h={'full'} borderTop={'0.4px solid #BDBDBD'}>
        <SidePanel />
        <Flex direction={'column'} width={'full'} overflow={'auto'}>
          <QueryEditor
            query={query}
            setQuery={setQuery}
            error={error}
            handleRunQuery={fetchData}
            isLoading={isQueryResponseLoading}
          />
          <DataMartTable
            data={queryResult.data}
            headers={queryResult.headers}
            loading={false}
          />
        </Flex>
      </Flex>
      <ActionDrawer isOpen={isOpen} onClose={onClose} />
    </>
  );
};

export default Scripts;
