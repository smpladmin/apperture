import { Box, Button, Flex, Text } from '@chakra-ui/react';
import LoadingSpinner from '@components/LoadingSpinner';
import { Funnel } from '@lib/domain/funnel';
import { Provider } from '@lib/domain/provider';
import { SavedItems, WatchListItemType } from '@lib/domain/watchlist';
import { getSavedFunnelsForUser } from '@lib/services/funnelService';
import { Row } from '@tanstack/react-table';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import WatchlistTable from '../Table';

const SavedFunnels = ({ provider }: { provider: Provider }) => {
  const [funnels, setFunnels] = useState<SavedItems[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const { dsId } = router.query;

  useEffect(() => {
    const getFunnels = async () => {
      let savedFunnels = (await getSavedFunnelsForUser()) || [];
      savedFunnels = savedFunnels.map((funnel: Funnel) => {
        return { type: WatchListItemType.FUNNELS, details: funnel };
      });
      setFunnels(savedFunnels);
      setIsLoading(false);
    };

    setIsLoading(true);
    getFunnels();
  }, []);

  const onRowClick = (row: Row<SavedItems>) => {
    const { _id, datasourceId } = row?.original?.details;
    router.push({
      pathname: `/analytics/funnel/view/[id]`,
      query: { id: _id, dsId: datasourceId },
    });
  };

  const handleRedirectToCreateFunnel = () => {
    router.push({
      pathname: '/analytics/funnel/create/[dsId]',
      query: { dsId },
    });
  };

  return (
    <Box px={{ base: '4', md: '30' }} py={'13'} overflowY={'auto'}>
      <Flex justifyContent={'space-between'}>
        <Text fontSize={'sh-24'} lineHeight={'sh-24'} fontWeight={'600'}>
          Funnels
        </Text>
        <Button
          disabled={provider === Provider.GOOGLE}
          variant={'primary'}
          bg={'black.100'}
          px={'6'}
          py={'4'}
          onClick={handleRedirectToCreateFunnel}
        >
          <Text
            color={'white.DEFAULT'}
            fontSize={'xs-14'}
            lineHeight={'xs-14'}
            fontWeight={'500'}
          >
            {'+ New Funnel'}
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
          <WatchlistTable savedItemsData={funnels} onRowClick={onRowClick} />
        )}
      </Box>
    </Box>
  );
};

export default SavedFunnels;
