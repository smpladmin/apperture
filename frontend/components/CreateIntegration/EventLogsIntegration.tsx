import { Box, Flex, Heading, Input, Text, useToast } from '@chakra-ui/react';
import Image from 'next/image';
import AppertureLogo from '@assets/images/apperture-logo-new.svg';
import FormButton from '@components/FormButton';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { createIntegrationWithDataSource } from '@lib/services/integrationService';
import { Provider } from '@lib/domain/provider';

import {
  TopProgress,
  IntegrationContainer,
  LeftContainer,
  RightContainer,
  LeftContainerRevisit,
} from '@components/Onboarding';

type EventLogsIntegrationProps = {
  handleClose: Function;
  add: string | string[] | undefined;
  edit?: boolean;
};
const EventLogsIntegration = ({
  add,
  handleClose,
}: EventLogsIntegrationProps) => {
  const router = useRouter();
  const [tableName, setTableName] = useState('');
  const toast = useToast();

  const handleGoBack = (): void => router.back();

  const onSubmit = async () => {
    const appId = router.query.appId as string;
    const provider = router.query.provider as Provider;

    const integration = await createIntegrationWithDataSource(
      appId,
      provider,
      undefined,
      undefined,
      undefined,
      tableName,
      undefined,
      undefined,
      undefined,
      undefined
    );
    router.replace({
      pathname: '/analytics/app/[appId]/integration/[provider]/complete',
      query: {
        appId: router.query.appId,
        provider: router.query.provider,
        dsId: integration.datasource._id,
      },
    });
  };

  return (
    <IntegrationContainer>
      {add ? <LeftContainerRevisit /> : <LeftContainer />}

      <RightContainer>
        <Flex flexDirection="column" alignItems="center">
          {add ? (
            <Box mt={10}></Box>
          ) : (
            <TopProgress handleGoBack={handleGoBack} />
          )}

          <Flex
            direction={'column'}
            h={'full'}
            justifyContent={{ base: 'space-between', md: 'start' }}
          >
            <Box>
              <Box
                height={{ base: 8, md: 14 }}
                width={{ base: 8, md: 14 }}
                mb={2}
              >
                <Image src={AppertureLogo} alt="branch" layout="responsive" />
              </Box>

              <Box>
                <Flex direction={'column'} gap={5}>
                  <Text
                    as="label"
                    color="grey.900"
                    fontSize={'xs-14'}
                    lineHeight={'xs-14'}
                    display="block"
                    htmlFor="table-name"
                  >
                    Table Name
                  </Text>

                  <Input
                    id="table-name"
                    size={'lg'}
                    width={{ base: 'full', md: 125 }}
                    bg={'white.100'}
                    rounded={'0.25rem'}
                    fontSize={'base'}
                    lineHeight={'base'}
                    textColor={'black.400'}
                    placeholder="Enter table name"
                    py={4}
                    px={3.5}
                    focusBorderColor={'black.100'}
                    border={'1px'}
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)}
                    _placeholder={{
                      fontSize: '1rem',
                      lineHeight: '1.375rem',
                      fontWeight: 400,
                      color: 'grey.100',
                    }}
                  />
                  <Text
                    color="grey.500"
                    fontSize={'xs-12'}
                    lineHeight={'xs-12'}
                    w={'125'}
                  >
                    Same table names across multiple datasources sources would
                    merge data in single table, different names save data into
                    distinct tables.
                  </Text>
                </Flex>
              </Box>
            </Box>
            <Box mt={5}>
              <FormButton
                navigateBack={() => router.back()}
                handleNextClick={onSubmit}
                disabled={!tableName}
                nextButtonName={add ? 'Add Data Source' : 'Create Application'}
              />
            </Box>
          </Flex>
        </Flex>
      </RightContainer>
    </IntegrationContainer>
  );
};

export default EventLogsIntegration;
