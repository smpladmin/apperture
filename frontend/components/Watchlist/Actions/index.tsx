import { Box, Button, Flex, Text } from '@chakra-ui/react';
import LoadingSpinner from '@components/LoadingSpinner';
import { ActionWithUser } from '@lib/domain/action';
import { Provider } from '@lib/domain/provider';
import { SavedItems, WatchListItemType } from '@lib/domain/watchlist';
import {
  deleteAction,
  getSavedActionsForDatasourceId,
} from '@lib/services/actionService';
import { Row } from '@tanstack/react-table';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import WatchlistTable from '../Table';
import appertureLogo from '@assets/images/apperture-filled-logo.svg';
import Image from 'next/image';

const SavedActions = ({ provider }: { provider: Provider }) => {
  const [actions, setActions] = useState<SavedItems[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [renderActions, setRenderActions] = useState(true);
  const router = useRouter();

  const { dsId } = router.query;

  useEffect(() => {
    if (!renderActions) return;
    const getActions = async () => {
      let savedActions =
        (await getSavedActionsForDatasourceId(dsId as string)) || [];
      savedActions = savedActions.map((action: ActionWithUser) => {
        return { type: WatchListItemType.ACTIONS, details: action };
      });
      setActions(savedActions);
      setIsLoading(false);
    };

    setIsLoading(true);
    getActions();
    setRenderActions(false);
  }, [renderActions]);

  const onRowClick = (row: Row<SavedItems>) => {
    const { _id, datasourceId } = row?.original?.details;
    router.push({
      pathname: `/analytics/action/edit/[id]`,
      query: { id: _id, dsId: datasourceId },
    });
  };

  const handleRedirectToCreateAction = () => {
    router.push({
      pathname: '/analytics/action/create/[dsId]',
      query: { dsId },
    });
  };

  const handleDelete = async (id: string) => {
    await deleteAction(id);
    setRenderActions(true);
  };

  return (
    <Box px={{ base: '4', md: '30' }} py={'13'} overflowY={'auto'}>
      <Flex justifyContent={'space-between'}>
        <Flex alignItems={'center'} gap={'6px'}>
          <Text
            fontSize={'xs-14'}
            lineHeight={'xs-14'}
            fontWeight={'400'}
            color={'grey.100'}
          >
            Fetching from
          </Text>
          <Image src={appertureLogo} alt={'apperture-logo'} />
          <Text fontSize={'xs-14'} lineHeight={'xs-14'} fontWeight={'500'}>
            Apperture Clickstream
          </Text>
        </Flex>
        <Button
          disabled={!(provider === Provider.APPERTURE)}
          variant={'primary'}
          bg={'black.100'}
          px={'6'}
          py={'4'}
          onClick={handleRedirectToCreateAction}
        >
          <Text
            color={'white.DEFAULT'}
            fontSize={'xs-14'}
            lineHeight={'xs-14'}
            fontWeight={'500'}
          >
            {'Define New Action'}
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
            savedItemsData={actions}
            onRowClick={onRowClick}
            handleDelete={handleDelete}
          />
        )}
      </Box>
    </Box>
  );
};

export default SavedActions;
