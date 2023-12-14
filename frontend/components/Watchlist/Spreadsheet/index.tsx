import { Box, Button, Flex, Text } from '@chakra-ui/react';
import LoadingSpinner from '@components/LoadingSpinner';
import { Provider } from '@lib/domain/provider';
import { SavedItems, WatchListItemType } from '@lib/domain/watchlist';
import { Row } from '@tanstack/react-table';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import WatchlistTable from '../Table';
import { getSavedWorkbooksForDatasourceId } from '@lib/services/workbookService';
import { WorkbookWithUser } from '@lib/domain/workbook';

const SavedSheets = ({ provider }: { provider: Provider }) => {
  const [sheets, setSheets] = useState<SavedItems[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { dsId } = router.query;

  useEffect(() => {
    const getWorkbooks = async () => {
      let savedWorkbooks =
        (await getSavedWorkbooksForDatasourceId(dsId as string)) || [];
      savedWorkbooks = savedWorkbooks.map((workbook: WorkbookWithUser) => {
        return { type: WatchListItemType.WORKBOOKS, details: workbook };
      });
      setSheets(savedWorkbooks);
      setIsLoading(false);
    };

    setIsLoading(true);
    getWorkbooks();
  }, []);

  const onRowClick = (row: Row<SavedItems>) => {
    const { _id, datasourceId } = row?.original?.details;
    router.push({
      pathname: `/analytics/workbook/edit/[workbookId]`,
      query: { workbookId: _id, dsId: datasourceId },
    });
  };

  const handleRedirectToCreateSpreadsheet = () => {
    router.push({
      pathname: '/analytics/workbook/create/[dsId]',
      query: { dsId },
    });
  };

  const handleDelete = async (id: string) => {};

  return (
    <Box px={{ base: '4', md: '30' }} py={'13'} overflowY={'auto'}>
      <Flex justifyContent={'space-between'}>
        <Text fontSize={'sh-24'} lineHeight={'sh-24'} fontWeight={'600'}>
          Spreadsheets
        </Text>
        <Button
          isDisabled={provider === Provider.GOOGLE}
          variant={'primary'}
          bg={'black.100'}
          px={'6'}
          py={'4'}
          onClick={handleRedirectToCreateSpreadsheet}
          data-testid={'new-sheet'}
        >
          <Text
            color={'white.DEFAULT'}
            fontSize={'xs-14'}
            lineHeight={'xs-14'}
            fontWeight={'500'}
          >
            {'+ New Sheet'}
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
            savedItemsData={sheets}
            onRowClick={onRowClick}
            handleDelete={handleDelete}
            disableDelete
          />
        )}
      </Box>
    </Box>
  );
};

export default SavedSheets;
