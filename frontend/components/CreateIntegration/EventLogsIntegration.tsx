import { Box, Button, Flex, Input, Text, useToast } from '@chakra-ui/react';
import Image from 'next/image';
import EventLogsLogo from '@assets/images/event-logs-logo.png';
import FormButton from '@components/FormButton';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import {
  ConfigCredential,
  createIntegrationWithDataSource,
} from '@lib/services/integrationService';
import { Provider } from '@lib/domain/provider';
import {
  TopProgress,
  IntegrationContainer,
  LeftContainer,
  RightContainer,
  LeftContainerRevisit,
} from '@components/Onboarding';
import { useDropzone } from 'react-dropzone';
import { DownloadSimple, UploadSimple, X } from 'phosphor-react';
import { SAMPLE_EVENT_CONFIG } from 'config';
import {
  getCredentials,
  updateCredentials,
} from '@lib/services/datasourceService';
import { Credential, CredentialType } from '@lib/domain/integration';

type EventLogsIntegrationProps = {
  handleClose: Function;
  add: string | string[] | undefined;
  edit?: boolean;
};

const convertJsonToFile = (
  json: object | null,
  fileName: string
): File | null => {
  if (!fileName || !json) return null;
  const jsonString = JSON.stringify(json, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const file = new File([blob], fileName, { type: 'application/json' });
  return file;
};

const EventLogsIntegration = ({
  add,
  handleClose,
  edit = false,
}: EventLogsIntegrationProps) => {
  const router = useRouter();
  const [tableName, setTableName] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isJSONValidated, setIsJSONValidated] = useState(false);
  const [parsedJson, setParsedJson] = useState<Record<string, any> | null>(
    null
  );
  const [fileName, setFileName] = useState('');
  const toast = useToast();

  const isButtonDisbaled =
    !tableName || Boolean(uploadedFile && !isJSONValidated);

  const handleGoBack = (): void => router.back();

  useEffect(() => {
    if (!edit) return;
    const getDatasourceCredentials = async () => {
      const { dsId } = router.query;
      const credentials: Credential = await getCredentials(dsId as string);
      setTableName(credentials?.tableName || '');
      setParsedJson(credentials?.events_config_credential?.config || {});
      setFileName(credentials?.events_config_credential?.config_file || '');
      setUploadedFile(
        convertJsonToFile(
          credentials?.events_config_credential?.config || null,
          credentials?.events_config_credential?.config_file || ''
        )
      );
    };
    getDatasourceCredentials();
  }, [edit]);

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setFileName(file.name);

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsedJson = JSON.parse(content);
          setParsedJson(parsedJson);
        } catch (error) {
          toast({
            title:
              'Error while reading JSON. Try uploading JSON as per given format.',
            status: 'error',
            variant: 'subtle',
            isClosable: true,
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        handleFileUpload(acceptedFiles[0]);
      }
    },
    [handleFileUpload]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      'application/json': ['.json'],
    },
  });

  const onSubmit = async () => {
    const appId = router.query.appId as string;
    const provider = router.query.provider as Provider;

    let eventsConfigCredential: ConfigCredential | undefined;
    if (parsedJson) {
      eventsConfigCredential = {
        config: parsedJson,
        config_file: fileName,
      };
    }

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
      undefined,
      undefined,
      eventsConfigCredential
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

  const onUpdate = async () => {
    const { dsId } = router.query;

    let eventsConfigCredential: ConfigCredential | undefined;
    if (parsedJson) {
      eventsConfigCredential = {
        config: parsedJson,
        config_file: fileName,
      };
    }

    const credentials: Credential = {
      type: CredentialType.EVENT_LOGS,
      tableName,
      events_config_credential: eventsConfigCredential,
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

  const validateJSON = () => {
    const isValidJson = Boolean(
      parsedJson &&
        parsedJson.hasOwnProperty('events_table_config') &&
        Object.values(parsedJson.events_table_config).every(
          (table: any) =>
            table.hasOwnProperty('id_path') && Array.isArray(table['tables'])
        )
    );

    setIsJSONValidated(isValidJson);
    toast({
      title: isValidJson ? 'Validated Successfully!' : 'Invalid JSON.',
      description: isValidJson
        ? ''
        : 'The JSON object does not strictly adhere to the expected format. Please check the structure and data types.',
      status: isValidJson ? 'success' : 'error',
      variant: 'subtle',
      isClosable: true,
    });
  };

  const handleDownload = () => {
    if (parsedJson) {
      const blob = new Blob([JSON.stringify(parsedJson)], {
        type: 'application/json',
      });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();

      URL.revokeObjectURL(link.href);
    }
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
                  src={EventLogsLogo}
                  alt="branch"
                  layout="responsive"
                  width={'56'}
                  height={'56'}
                />
              </Box>

              <Flex direction={'column'} gap={'8'}>
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
                    disabled={edit}
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
                    Same table names across multiple datasources would merge
                    data in single table, different names would save data into
                    distinct tables.
                  </Text>
                </Flex>
                <Flex direction={'column'} gap={5}>
                  <Text
                    color="grey.900"
                    fontSize={'xs-14'}
                    lineHeight={'xs-14'}
                  >
                    Data Table Router (Optional)
                  </Text>
                  <Flex alignItems={'center'} gap={'2'}>
                    <Box
                      border={'1px'}
                      py={2}
                      width={100}
                      px={3}
                      rounded={'0.25rem'}
                      {...getRootProps()}
                    >
                      <input {...getInputProps()} />
                      {uploadedFile ? (
                        <Flex
                          alignItems={'center'}
                          justifyContent={'space-between'}
                        >
                          <Text fontSize={'xs-12'} lineHeight={'xs-12'}>
                            {fileName}
                          </Text>
                          <X
                            size={24}
                            color={'#fc0303'}
                            onClick={() => {
                              setUploadedFile(null);
                              setParsedJson(null);
                            }}
                            cursor={'pointer'}
                          />
                        </Flex>
                      ) : (
                        <Flex alignItems={'center'} gap={'4'}>
                          <Box
                            border={'1px'}
                            width={'fit-content'}
                            p={'2'}
                            borderRadius={'4px'}
                            cursor={'pointer'}
                            borderColor={'grey.100'}
                          >
                            <Flex alignItems={'center'} gap={'1'}>
                              <UploadSimple size={16} color={'#039dfc'} />
                              <Text
                                fontSize={'xs-12'}
                                lineHeight={'xs-12'}
                                color={'#039dfc'}
                              >
                                {'Upload File'}
                              </Text>
                            </Flex>
                          </Box>
                          <Text fontSize={'xs-12'} lineHeight={'xs-12'}>
                            No file chosen
                          </Text>
                        </Flex>
                      )}
                    </Box>
                    {!!uploadedFile && (
                      <>
                        <Button
                          bg={'#000000'}
                          color={'white'}
                          variant={'primary'}
                          onClick={validateJSON}
                        >
                          Validate
                        </Button>
                        <DownloadSimple
                          size={28}
                          onClick={handleDownload}
                          cursor={'pointer'}
                        />
                      </>
                    )}
                  </Flex>
                  <Text
                    color="grey.900"
                    fontSize={'xs-12'}
                    lineHeight={'xs-12'}
                  >
                    The JSON should strictly adhere to
                    <a
                      href={SAMPLE_EVENT_CONFIG}
                      target="_blank"
                      style={{ color: '#039dfc' }}
                      rel="noopener noreferrer"
                    >
                      THIS FORMAT
                    </a>
                  </Text>
                </Flex>
              </Flex>
            </Box>
            <Box mt={5}>
              <FormButton
                navigateBack={() => router.back()}
                handleNextClick={() => (edit ? onUpdate() : onSubmit())}
                disabled={isButtonDisbaled}
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

export default EventLogsIntegration;
