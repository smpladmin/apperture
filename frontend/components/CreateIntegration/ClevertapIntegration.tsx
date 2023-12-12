import {
  Box,
  chakra,
  Flex,
  Heading,
  IconButton,
  Input,
  Text,
  useToast,
} from '@chakra-ui/react';
import clevertapLogo from '@assets/images/clevertap-icon.png';
import Image from 'next/image';
import FormButton from '@components/FormButton';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { createIntegrationWithDataSource } from '@lib/services/integrationService';
import { Provider } from '@lib/domain/provider';

import Papa from 'papaparse';
import {
  TopProgress,
  IntegrationContainer,
  LeftContainer,
  RightContainer,
  LeftContainerRevisit,
} from '@components/Onboarding';
import { CaretRight, CheckCircle, FileArrowUp } from 'phosphor-react';
import {
  getCredentials,
  updateCredentials,
} from '@lib/services/datasourceService';
import { CredentialType, Credential } from '@lib/domain/integration';

type ClevertapIntegrationProps = {
  handleClose: Function;
  add: string | string[] | undefined;
  edit?: boolean;
};
const ClevertapIntegration = ({
  add,
  handleClose,
  edit = false,
}: ClevertapIntegrationProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [projectId, setProjectId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [validData, setValidData] = useState(false);
  const [eventList, setEventList] = useState<string[]>([]);
  const toast = useToast();

  const handleGoBack = (): void => router.back();

  useEffect(() => {
    setValidData(!!(projectId && apiKey && apiSecret && eventList.length));
  }, [projectId, apiKey, apiSecret, eventList]);

  useEffect(() => {
    if (!edit) return;
    const getDatasourceCredentials = async () => {
      const { dsId } = router.query;
      const credentials = await getCredentials(dsId as string);
      setApiSecret(credentials?.secret || '');
      setApiKey(credentials?.api_key || '');
      setProjectId(credentials?.account_id || '');
    };
    getDatasourceCredentials();
  }, [edit]);

  const onUpdate = async () => {
    const { dsId } = router.query;

    const credentials: Credential = {
      type: CredentialType.API_KEY,
      account_id: projectId,
      secret: apiSecret,
      api_key: apiKey,
    };
    const response = await updateCredentials(dsId as string, credentials);
    if (response.status === 200) {
      toast({
        title: 'Credentials updated successfully',
        status: 'success',
        variant: 'subtle',
        isClosable: true,
      });
      router.back();
    } else {
      toast({
        title: 'An error occurred while updating credentials',
        status: 'error',
        variant: 'subtle',
        isClosable: true,
      });
    }
  };
  const onSubmit = async () => {
    const appId = router.query.appId as string;
    const provider = router.query.provider as Provider;

    const integration = await createIntegrationWithDataSource(
      appId,
      provider,
      projectId,
      apiKey,
      apiSecret,
      '',
      undefined,
      undefined,
      undefined,
      undefined,
      eventList
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
                <Image
                  src={clevertapLogo}
                  alt="clevertap"
                  layout="responsive"
                />
              </Box>

              <Heading
                as={'h2'}
                mb={{ base: 8, md: 10 }}
                fontSize={{ base: 'sh-18', md: 'sh-18' }}
                lineHeight={{ base: '2.125rem', md: '4.125rem' }}
                fontWeight={'semibold'}
                maxW={200}
              >
                Enter Details to fetch data from Clevertap
              </Heading>
              <Box>
                <Box
                  borderWidth="1px"
                  borderColor="gray.300"
                  borderRadius={'20'}
                  rounded="md"
                  p={4}
                  display="flex"
                  alignItems="center"
                  onClick={() => {
                    if (fileInputRef?.current) {
                      fileInputRef.current.click();
                    }
                  }}
                  cursor={'pointer'}
                  mb={5}
                >
                  {eventList.length ? (
                    <CheckCircle size={30} color="#212121" />
                  ) : (
                    <FileArrowUp size={30} color="#212121" />
                  )}

                  <Box flex="1" minW="350" pl={2}>
                    <Text
                      fontSize="xs-14"
                      fontWeight="semibold"
                      color="gray.900"
                    >
                      Upload a CSV
                    </Text>
                    <Text fontSize="xs-10" color="gray.500">
                      Select a file to upload
                    </Text>
                  </Box>
                  <input
                    type="file"
                    accept=".csv"
                    ref={fileInputRef}
                    style={{ visibility: 'hidden', width: 0 }}
                    onChange={(e) => {
                      if (e.target?.files?.[0]) {
                        const file = e.target?.files?.[0];
                        Papa.parse(file, {
                          complete: (file: any) => {
                            if (
                              Object.keys(file.data[0]).includes('event_name')
                            ) {
                              const event_list = file.data
                                .map((i: any) => i?.event_name)
                                .filter(
                                  (
                                    elem: string,
                                    index: number,
                                    array: string[]
                                  ) => array.indexOf(elem) === index
                                );
                              setEventList(event_list);
                            } else {
                              toast({
                                title: `Invalid file structure`,
                                status: 'error',
                                variant: 'subtle',
                                isClosable: true,
                              });
                            }
                          },
                          header: true,
                          dynamicTyping: true,
                          skipEmptyLines: true,
                          transformHeader: (header) =>
                            header.toLowerCase().replace(/\W/g, '_'),
                        });
                      }
                    }}
                  />
                </Box>
                <Box mb={5}>
                  <Text
                    as="label"
                    color="grey.100"
                    fontSize={'xs-14'}
                    lineHeight={'xs-14'}
                    display="block"
                    htmlFor="projectId"
                  >
                    Project ID
                  </Text>
                  <Input
                    id="projectId"
                    size={'lg'}
                    width={{ base: 'full', md: 125 }}
                    bg={'white.100'}
                    rounded={'0.25rem'}
                    fontSize={'base'}
                    lineHeight={'base'}
                    textColor={'black.400'}
                    placeholder="Enter 7 Digit Project ID"
                    py={4}
                    px={3.5}
                    focusBorderColor={'black.100'}
                    border={'1px'}
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    _placeholder={{
                      fontSize: '1rem',
                      lineHeight: '1.375rem',
                      fontWeight: 400,
                      color: 'grey.100',
                    }}
                  />
                </Box>
                <Box mb={5}>
                  <Text
                    as="label"
                    color="grey.100"
                    fontSize={'xs-14'}
                    lineHeight={'xs-14'}
                    display="block"
                    htmlFor="apiKey"
                  >
                    API Key
                  </Text>
                  <Input
                    id="apiKey"
                    size={'lg'}
                    width={{ base: 'full', md: 125 }}
                    bg={'white.100'}
                    rounded={'0.25rem'}
                    fontSize={'base'}
                    lineHeight={'base'}
                    textColor={'black.400'}
                    placeholder="Enter 6 Digit API Key"
                    py={4}
                    px={3.5}
                    focusBorderColor={'black.100'}
                    border={'1px'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    _placeholder={{
                      fontSize: '1rem',
                      lineHeight: '1.375rem',
                      fontWeight: 400,
                      color: 'grey.100',
                    }}
                  />
                </Box>
                <Box mb={10}>
                  <Text
                    as="label"
                    color="grey.100"
                    fontSize={'xs-14'}
                    lineHeight={'xs-14'}
                    display="block"
                    htmlFor="apiSecret"
                  >
                    API Secret
                  </Text>
                  <Input
                    id="apiSecret"
                    size={'lg'}
                    width={{ base: 'full', md: 125 }}
                    bg={'white.100'}
                    rounded={'0.25rem'}
                    fontSize={'base'}
                    lineHeight={'base'}
                    textColor={'black.400'}
                    placeholder="Enter API Secret"
                    py={4}
                    px={3.5}
                    focusBorderColor={'black.100'}
                    border={'1px'}
                    value={apiSecret}
                    onChange={(e) => setApiSecret(e.target.value)}
                    _placeholder={{
                      fontSize: '1rem',
                      lineHeight: '1.375rem',
                      fontWeight: 400,
                      color: 'grey.100',
                    }}
                  />
                </Box>
              </Box>
            </Box>
            <Box mb={5}>
              <FormButton
                navigateBack={() => router.back()}
                handleNextClick={() => (edit ? onUpdate() : onSubmit())}
                disabled={!validData}
                nextButtonName={
                  edit
                    ? 'Update Credentials'
                    : add
                    ? 'Add Data Source'
                    : 'Create Application'
                }
              />
            </Box>
          </Flex>
        </Flex>
      </RightContainer>
    </IntegrationContainer>
  );
};

export default ClevertapIntegration;
