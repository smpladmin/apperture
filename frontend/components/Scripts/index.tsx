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
import { DatamartAction } from '@lib/domain/datamartActions';

const Scripts = ({
  savedDatamart,
  savedDatamartActions,
  isAuthenticated,
}: {
  savedDatamart?: DataMartObj;
  savedDatamartActions?: DatamartAction[];
  isAuthenticated?: boolean;
}) => {
  const [isQueryResponseLoading, setIsQueryResponseLoading] = useState(false);
  const [name, setName] = useState<string>(
    savedDatamart?.name || 'Untitled Table'
  );

  const [query, setQuery] = useState(savedDatamart?.query || '');
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
  const { dsId, dataMartId, showActionDrawer } = router.query;
  const datasourceId = (dsId as string) || savedDatamart?.datasourceId;
  const [savedDatamartId, setDatamartId] = useState(
    (dataMartId as string) || ''
  );

  const { isOpen, onOpen, onClose } = useDisclosure({
    defaultIsOpen: !!showActionDrawer,
  });

  const openActionDrawer = async () => {
    if (!savedDatamartId) {
      const response = await saveDataMartTable(datasourceId!!, query, name);
      setDatamartId(response.data?._id);
    }
    onOpen();
  };

  const fetchData = async () => {
    setIsQueryResponseLoading(true);
    const res = await computeDataMartQuery(datasourceId!!, query, true);
    if (res.status === 200) {
      const queriedData = res?.data;
      setQueryResult({
        data: queriedData?.data,
        headers: queriedData?.headers,
      });
      setSaveButtonDisabled(false);
      setError('');
    } else {
      setQueryResult({
        data: [],
        headers: [],
      });
      setError((res as ErrorResponse)?.error?.detail);
    }
    setIsQueryResponseLoading(false);
  };

  useEffect(() => {
    if (router.pathname.includes('edit') || savedDatamartId)
      setIsDataMartBeingEdited(true);
  }, [savedDatamartId]);

  useEffect(() => {
    if (!query) return;
    fetchData();
  }, []);

  const handleSaveAndUpdate = async () => {
    setSaveButtonDisabled(true);
    const response = isDataMartBeingEdited
      ? await updateDataMartTable(savedDatamartId, datasourceId!!, query, name)
      : await saveDataMartTable(datasourceId!!, query, name);
    if (response.status === 200) {
      router.push({
        pathname: '/analytics/datamart/edit/[dataMartId]',
        query: { dataMartId: response.data?._id || savedDatamartId, dsId },
      });
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
        <SidePanel savedDatamartDsId={savedDatamart?.datasourceId} />
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
      <ActionDrawer
        isOpen={isOpen}
        onClose={onClose}
        datamartId={savedDatamartId}
        workbookName={name}
        savedDatamartActions={savedDatamartActions}
        isAuthenticated={isAuthenticated}
      />
    </>
  );
};

export default Scripts;
