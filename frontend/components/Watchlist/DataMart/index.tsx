import { Box, Button, Flex, Link, Text } from '@chakra-ui/react';
import LoadingSpinner from '@components/LoadingSpinner';
import { DataMartWithUser } from '@lib/domain/datamart';
import { Provider } from '@lib/domain/provider';
import { SavedItems, WatchListItemType } from '@lib/domain/watchlist';
import {
  deleteDataMart,
  getSavedDataMartsForDatasourceId,
} from '@lib/services/dataMartService';
import { CellContext, Row, createColumnHelper } from '@tanstack/react-table';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useState } from 'react';
import WatchlistTable from '../Table';
import Details from '../Table/Details';
import UserInfo from '../Table/UserInfo';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import Actions from '../Table/Actions';
import { dateFormat } from '@lib/utils/common';
import DatamartActionsType from './DatamartActionsType';

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
  const columnHelper = createColumnHelper<SavedItems>();
  const columns = useMemo(() => {
    return [
      columnHelper.accessor('details', {
        header: 'Name',
        cell: (info) => <Details info={info} />,
      }),
      columnHelper.accessor('details.actions', {
        header: 'Actions',
        cell: (info: CellContext<SavedItems, DataMartWithUser>) => (
          <DatamartActionsType info={info} />
        ),
      }),
      columnHelper.accessor('details.user', {
        cell: (info) => <UserInfo info={info} />,
        header: 'Created By',
      }),
      columnHelper.accessor('details.updatedAt', {
        cell: (info) => {
          const updatedAt = info.getValue() as Date;
          return dayjs.utc(updatedAt).local().format(dateFormat);
        },
        header: 'Last Updated',
      }),
      columnHelper.accessor('details._id', {
        cell: (info) => (
          <Actions
            info={info}
            handleDelete={handleDelete}
            disableDelete={false}
          />
        ),
        header: '',
      }),
    ];
  }, []);

  return (
    <Box px={{ base: '4', md: '30' }} py={'13'} overflowY={'auto'}>
      <Flex justifyContent={'space-between'}>
        <Text fontSize={'sh-24'} lineHeight={'sh-24'} fontWeight={'600'}>
          My Data
        </Text>
        <Flex alignItems={'center'} gap={'2'}>
          <Button
            isDisabled={provider === Provider.GOOGLE}
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
            type={WatchListItemType.DATAMARTS}
            tableColumns={columns}
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
