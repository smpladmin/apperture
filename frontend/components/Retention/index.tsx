import { Box, Button, ButtonGroup, Flex } from '@chakra-ui/react';
import Card from '@components/Card';
import ActionPanel from '@components/EventsLayout/ActionPanel';
import ViewPanel from '@components/EventsLayout/ViewPanel';
import CreateFunnelAction from '@components/Funnel/CreateFunnel/CreateFunnelAction';
import TransientFunnelView from '@components/Funnel/components/TransientFunnelView';
import Header from '@components/EventsLayout/ActionHeader';
import { useRouter } from 'next/router';
import React from 'react';
import DateFilterComponent from '@components/Date/DateFilter';
import RetentionEmptyState from './RetentionEmptyState';
import { Hash, Percent } from 'phosphor-react';
import { GREY_600 } from '@theme/index';
import { CreateRetentionAction } from './CreateRetentionAction';

const Retention = () => {
  const router = useRouter();

  return (
    <Flex
      px={'5'}
      direction={'column'}
      h={'full'}
      bg={'white.400'}
      overflow={'auto'}
    >
      <Header
        handleGoBack={() => router.back()}
        name={'funnelName'}
        setName={() => {}}
        handleSave={() => {}}
        isSaveButtonDisabled={true}
      />
      <Flex
        direction={{ base: 'column', md: 'row' }}
        gap={'5'}
        flexGrow={1}
        bg={'white.400'}
      >
        <ActionPanel>
          <Card>
            <CreateRetentionAction />
          </Card>
        </ActionPanel>
        <ViewPanel>
          <Flex direction={'column'} gap={'5'}>
            <Flex justifyContent={'space-between'}>
              <DateFilterComponent
                dateFilter={{
                  filter: null,
                  type: null,
                }}
                setDateFilter={() => {}}
                isDisabled={false}
              />
              <ButtonGroup
                size="sm"
                isAttached
                variant="outline"
                isDisabled={false}
                borderRadius={'8'}
              >
                <Button
                  borderWidth={'1px'}
                  borderStyle={'solid'}
                  borderColor={'grey.400'}
                  id="yesterday"
                  background={'white.DEFAULT'}
                  color={'black.DEFAULT'}
                  fontWeight={500}
                  _hover={{
                    background: 'white.500',
                  }}
                  height={8}
                  fontSize={'xs-12'}
                >
                  <Hash size={16} color={GREY_600} />
                </Button>
                <Button
                  borderWidth={'1px'}
                  borderStyle={'solid'}
                  borderColor={'grey.400'}
                  id="yesterday"
                  background={'white.DEFAULT'}
                  color={'black.DEFAULT'}
                  fontWeight={500}
                  _hover={{
                    background: 'white.500',
                  }}
                  height={8}
                  fontSize={'xs-12'}
                >
                  <Percent size={16} color={GREY_600} />
                </Button>
              </ButtonGroup>
            </Flex>
            {true ? (
              <Card minHeight={'120'} borderRadius={'16'}>
                <RetentionEmptyState />
              </Card>
            ) : (
              <Box h={30} width={30} bg={'black'}></Box>
            )}
          </Flex>
        </ViewPanel>
      </Flex>
    </Flex>
  );
};

export default Retention;
