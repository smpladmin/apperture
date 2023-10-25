import { Button, Flex, Text } from '@chakra-ui/react';
import { AppWithIntegrations } from '@lib/domain/app';
import { groupBy, unionBy } from 'lodash';
import { useRouter } from 'next/router';
import { Plus } from 'phosphor-react';
import React, { useEffect, useState } from 'react';
import DSList from './DSList';
import { Provider } from '@lib/domain/provider';

function EditDataSource({ apps }: any) {
  const router = useRouter();

  const { appId } = router.query;

  const [currentApp, setCurrentApp] = useState<AppWithIntegrations>(
    apps.apps?.filter((i: AppWithIntegrations) => i._id == appId)?.[0] ||
      apps.apps?.[0]
  );
  const [integrations, setIntegrations] = useState(
    groupBy(currentApp.integrations, (item) => item.provider)
  );
  const handleAddIntegration = async () => {
    router.push({
      pathname: `/analytics/app/[appId]/integration/select`,

      query: { appId: appId, ...router.query, add: 'true' },
    });
  };

  return (
    <Flex direction={'column'} h={'fit-content'} w={'full'} px={20} pt={15}>
      <Flex w="full" justifyContent={'space-between'}>
        <Text fontSize={'24px'} lineHeight={'30px'} fontWeight={600}>
          Integrated Data Sources
        </Text>
        <Button
          py={'4'}
          px={'3'}
          bg={'black.400'}
          variant={'primary'}
          fontSize={'xs-14'}
          lineHeight={'xs-14'}
          fontWeight={'500'}
          color={'white.DEFAULT'}
          onClick={handleAddIntegration}
        >
          <Plus color="white" style={{ marginRight: '4px' }} />
          Add data source
        </Button>
      </Flex>
      <Flex w="full" direction={'column'}>
        {Object.keys(integrations).map((key) => {
          const datasources = unionBy(
            integrations[key].flatMap((integration) => integration.datasources)
          );
          return (
            <DSList
              key={key}
              provider={key as Provider}
              datasources={datasources}
            />
          );
        })}
      </Flex>
    </Flex>
  );
}

export default EditDataSource;
