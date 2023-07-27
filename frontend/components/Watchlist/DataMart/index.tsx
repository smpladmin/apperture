import { Box, Button, Flex, Text } from '@chakra-ui/react';
import LoadingSpinner from '@components/LoadingSpinner';
import { DataMartWithUser } from '@lib/domain/datamart';
import { Provider } from '@lib/domain/provider';
import { SavedItems, WatchListItemType } from '@lib/domain/watchlist';
import {
  deleteDataMart,
  getSavedDataMartsForDatasourceId,
} from '@lib/services/dataMartService';
import { Row } from '@tanstack/react-table';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import WatchlistTable from '../Table';

const SavedDataMarts = ({ provider }: { provider: Provider }) => {
  const [dataMarts, setDataMarts] = useState<SavedItems[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [renderDataMart, setRenderDataMart] = useState(true);
  const router = useRouter();

  const { dsId } = router.query;

  useEffect(() => {
    if (!renderDataMart) return;
    const getDataMarts = async () => {
      let savedDataMarts =
        (await getSavedDataMartsForDatasourceId(dsId as string)) || [];
      savedDataMarts = savedDataMarts.map((datamart: DataMartWithUser) => {
        return { type: WatchListItemType.DATAMARTS, details: datamart };
      });
      setDataMarts(savedDataMarts);
      setIsLoading(false);
    };

    setIsLoading(true);
    getDataMarts();
    setRenderDataMart(false);
  }, [renderDataMart]);

  const onRowClick = (row: Row<SavedItems>) => {
    const { _id, datasourceId } = row?.original?.details;
    router.push({
      pathname: `/analytics/datamart/edit/[id]`,
      query: { id: _id, dsId: datasourceId },
    });
  };

  const handleRedirectToCreateDataMart = () => {
    router.push({
      pathname: '/analytics/datamart/create/[dsId]',
      query: { dsId },
    });
  };

  const handleDelete = async (id: string) => {
    await deleteDataMart(id);
    setRenderDataMart(true);
  };

  return (
    <Box px={{ base: '4', md: '30' }} py={'13'} overflowY={'auto'}>
      <Flex justifyContent={'space-between'}>
        <Text fontSize={'sh-24'} lineHeight={'sh-24'} fontWeight={'600'}>
          My Data
        </Text>
        <Button
          disabled={provider === Provider.GOOGLE}
          variant={'primary'}
          bg={'black.100'}
          px={'6'}
          py={'4'}
          onClick={handleRedirectToCreateDataMart}
        >
          <Text
            color={'white.DEFAULT'}
            fontSize={'xs-14'}
            lineHeight={'xs-14'}
            fontWeight={'500'}
          >
            {'+ Create Table'}
          </Text>
        </Button>
      </Flex>

      <Box mt={'7'}>
        {isLoading ? (
          <Flex
            w={'full'}
            h={'full'}
            minH={'80'}
            justifyContent={'center'}
            alignItems={'center'}
          >
            <LoadingSpinner />
          </Flex>
        ) : (
          <WatchlistTable
            savedItemsData={dataMarts}
            onRowClick={onRowClick}
            handleDelete={handleDelete}
          />
        )}
      </Box>
    </Box>
  );
};

export default SavedDataMarts;
