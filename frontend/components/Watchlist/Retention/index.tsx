import { Box, Button, Flex, Text } from '@chakra-ui/react';
import LoadingSpinner from '@components/LoadingSpinner';
import { Provider } from '@lib/domain/provider';
import { RetentionWithUser } from '@lib/domain/retention';
import { SavedItems, WatchListItemType } from '@lib/domain/watchlist';
import {
  deleteRetention,
  getSavedRetentionsForDatasourceId,
} from '@lib/services/retentionService';
import { Row } from '@tanstack/react-table';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import WatchlistTable from '../Table';

const SavedRetentions = ({ provider }: { provider: Provider }) => {
  const [retentions, setRetentions] = useState<SavedItems[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [renderRetention, setRenderRetention] = useState(true);
  const router = useRouter();

  const { dsId } = router.query;

  useEffect(() => {
    if (!renderRetention) return;
    const getRetentions = async () => {
      let savedRetentions =
        (await getSavedRetentionsForDatasourceId(dsId as string)) || [];
      savedRetentions = savedRetentions.map((retention: RetentionWithUser) => {
        return { type: WatchListItemType.RETENTIONS, details: retention };
      });
      setRetentions(savedRetentions);
      setIsLoading(false);
    };

    setIsLoading(true);
    getRetentions();
    setRenderRetention(false);
  }, [renderRetention]);

  const onRowClick = (row: Row<SavedItems>) => {
    const { _id, datasourceId } = row?.original?.details;
    router.push({
      pathname: `/analytics/retention/view/[id]`,
      query: { id: _id, dsId: datasourceId },
    });
  };

  const handleRedirectToCreateRetention = () => {
    router.push({
      pathname: '/analytics/retention/create/[dsId]',
      query: { dsId },
    });
  };

  const handleDelete = async (id: string) => {
    await deleteRetention(id, dsId as string);
    setRenderRetention(true);
  };

  return (
    <Box px={{ base: '4', md: '30' }} py={'13'} overflowY={'auto'}>
      <Flex justifyContent={'space-between'}>
        <Text fontSize={'sh-24'} lineHeight={'sh-24'} fontWeight={'600'}>
          Rentention
        </Text>
        <Button
          isDisabled={provider === Provider.GOOGLE}
          variant={'primary'}
          bg={'black.100'}
          px={'6'}
          py={'4'}
          onClick={handleRedirectToCreateRetention}
        >
          <Text
            color={'white.DEFAULT'}
            fontSize={'xs-14'}
            lineHeight={'xs-14'}
            fontWeight={'500'}
          >
            {'+ New Retention'}
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
            savedItemsData={retentions}
            onRowClick={onRowClick}
            handleDelete={handleDelete}
          />
        )}
      </Box>
    </Box>
  );
};

export default SavedRetentions;
