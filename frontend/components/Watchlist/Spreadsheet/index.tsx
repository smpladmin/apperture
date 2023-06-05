import { Box, Button, Flex, Text } from '@chakra-ui/react';
import LoadingSpinner from '@components/LoadingSpinner';
import { Provider } from '@lib/domain/provider';
import { SavedItems } from '@lib/domain/watchlist';
import { Row } from '@tanstack/react-table';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import WatchlistTable from '../Table';

const SavedSheets = ({ provider }: { provider: Provider }) => {
  const [sheets, setSheets] = useState<SavedItems[]>([]);
  const [isLoading] = useState(false);

  const router = useRouter();
  const { dsId } = router.query;

  const onRowClick = (row: Row<SavedItems>) => {};

  const handleRedirectToCreateSpreadsheet = () => {
    router.push({
      pathname: '/analytics/spreadsheet/create/[dsId]',
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
          disabled={provider === Provider.GOOGLE}
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
          />
        )}
      </Box>
    </Box>
  );
};

export default SavedSheets;
