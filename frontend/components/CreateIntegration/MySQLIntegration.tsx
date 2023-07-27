import {
  Box,
  Button,
  chakra,
  Checkbox,
  Flex,
  Heading,
  IconButton,
  Input,
  Text,
  useToast,
} from '@chakra-ui/react';
import mysqlLogo from '@assets/images/mysql-icon.png';
import Image from 'next/image';
import FormButton from '@components/FormButton';
import { useRouter } from 'next/router';
import { useState } from 'react';
import {
  createIntegrationWithDataSource,
  testMySQLConnection,
} from '@lib/services/integrationService';
import { Provider } from '@lib/domain/provider';
import { MySQLCredential } from '@lib/domain/integration';
import { useForm } from 'react-hook-form';
import logo from '@assets/images/AppertureWhiteLogo.svg';
import onboarding_left_panel from '@assets/images/onboarding_left_panel.svg';
import {
  TopProgress,
  IntegrationContainer,
  LeftContainer,
  RightContainer,
  LeftContainerRevisit,
} from '@components/Onboarding';

type MySQLIntegrationProps = {
  handleClose: Function;
  add: string | string[] | undefined;
};


type FormData = {
  host: string;
  port: string;
  username: string;
  password: string;
  overSsh: boolean;
  sshServer: string;
  sshPort: string;
  sshUsername: string;
  sshPassword: string;
  useSshKey: boolean;
  sshKey: FileList;
};
const MySQLIntegration = ({ add, handleClose }: MySQLIntegrationProps) => {
  const router = useRouter();
  const handleGoBack = (): void => router.back();
  const toast = useToast();
  const [isConnectionValid, setIsConnectionValid] = useState(false);

  const getFileContent = async (file: Blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const keyContent = reader.result;
        try {
          resolve(keyContent as string);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsText(file);
    });
  };

  const processFormData = async (data: FormData) => {
    let sshFileContent = null;
    if (data.overSsh && data.useSshKey) {
      const file = data.sshKey[0];
      sshFileContent = await getFileContent(file);
    }

    const databaseSshCredential = data.overSsh
      ? {
          server: data.sshServer,
          port: data.sshPort,
          username: data?.sshUsername,
          password: data?.sshPassword,
          useSshKey: data?.useSshKey,
          sshKey: sshFileContent,
        }
      : undefined;

    const mySQLCredential = {
      host: data.host,
      port: data.port,
      username: data.username,
      password: data.password,
      overSsh: data.overSsh,
      sshCredential: databaseSshCredential,
    };

    return mySQLCredential;
  };

  const onSubmit = async (data: FormData) => {
    const appId = router.query.appId as string;
    const provider = router.query.provider as Provider;
    const mySQLCredential = await processFormData(data);
    const integration = await createIntegrationWithDataSource(
      appId,
      provider,
      undefined,
      undefined,
      undefined,
      '',
      mySQLCredential as MySQLCredential
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

  const onTest = async (data: FormData) => {
    const mySQLCredential = await processFormData(data);
    const validConnection = await testMySQLConnection(
      mySQLCredential as MySQLCredential
    );
    // setIsConnectionValid(validConnection);
    setIsConnectionValid(true);
    toast({
      title: validConnection ? 'Connection Successfull' : 'Connection Failed',
      status: validConnection ? 'success' : 'error',
      variant: 'subtle',
      isClosable: true,
    });
  };

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    trigger,
  } = useForm<FormData>({
    defaultValues: {
      host: '',
      port: '3306',
      username: '',
      password: '',
      sshServer: '',
      sshPort: '22',
      sshUsername: '',
      sshPassword: '',
    },
  });
  const showSshFields = watch('overSsh', false);
  const useSshKey = watch('useSshKey', false);

  const validateForm = () => {
    const arePrimaryCredsValid = Boolean(
      watch('host') && watch('port') && watch('username') && watch('password')
    );
    const areSshCredsValid = watch('overSsh')
      ? Boolean(watch('sshPort') && watch('sshServer'))
      : true;
    const isSshKeyValid = watch('useSshKey') ? Boolean(watch('sshKey')) : true;
    return arePrimaryCredsValid && areSshCredsValid && isSshKeyValid;
  };

  const handleTestConnection = () => {
    if (!validateForm()) {
      setIsConnectionValid(false);
    }
    handleSubmit(onTest)();
  };

  const handleChange = () => {
    setIsConnectionValid(false);
  };

  return (
    <IntegrationContainer>
      
       { add ? <LeftContainerRevisit/> : <LeftContainer /> }
     
      <RightContainer>
          <Flex
            flexDirection="column"
            alignItems="center"
          >
                   { add ? <Box mt={10}></Box> : <TopProgress handleGoBack={handleGoBack} /> }

                    <Flex
                            direction={'column'}
                            h={'full'}
                            justifyContent={{ base: 'space-between', md: 'start' }}
                          >
                        <Box>
                          
                          <Box height={{ base: 8, md: 14 }} width={{ base: 8, md: 14 }} mb={2}>
                            <Image src={mysqlLogo} alt="mixpanel" layout="responsive" />
                          </Box>
                          
                          <Heading
                            as={'h2'}
                            mb={{ base: 5, md: 5 }}
                            fontSize={{ base: 'sh-18', md: 'sh-18' }}
                            lineHeight={{ base: '2.125rem', md: '4.125rem' }}
                            fontWeight={'semibold'}
                            maxW={200}
                          >
                            Enter Details to fetch data from MySQL
                          </Heading>

                          <Flex w={125}>
                            <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
                              <Flex direction={'column'} gap={'4'}>
                                <FormInputField
                                  fieldName="host"
                                  label="Host"
                                  errors={errors}
                                  handleChange={handleChange}
                                  register={register}
                                  inputStyle={{ placeholder: '127.0.0.1', width: '60' }}
                                />
                                <FormInputField
                                  fieldName="port"
                                  label="Port"
                                  errors={errors}
                                  handleChange={handleChange}
                                  register={register}
                                  inputStyle={{ placeholder: '3306', width: '40' }}
                                />

                                <FormInputField
                                  fieldName="username"
                                  label="Username"
                                  errors={errors}
                                  handleChange={handleChange}
                                  register={register}
                                  inputStyle={{ placeholder: 'user', width: '50' }}
                                />
                                <FormInputField
                                  fieldName="password"
                                  label="Password"
                                  errors={errors}
                                  handleChange={handleChange}
                                  register={register}
                                  inputStyle={{ placeholder: 'password', width: '50' }}
                                />

                                <FormCheckboxField
                                  fieldName="overSsh"
                                  label="Over SSH"
                                  register={register}
                                />
                                {showSshFields && (
                                  <Flex direction={'column'} gap={'4'}>
                                    <FormInputField
                                      fieldName="sshServer"
                                      label="Server"
                                      errors={errors}
                                      handleChange={handleChange}
                                      register={register}
                                      inputStyle={{ placeholder: '192.168.1.1', width: '60' }}
                                    />
                                    <FormInputField
                                      fieldName="sshPort"
                                      label="Port"
                                      errors={errors}
                                      handleChange={handleChange}
                                      register={register}
                                      inputStyle={{ placeholder: '22', width: '40' }}
                                    />

                                    <FormInputField
                                      fieldName="sshUsername"
                                      label="Username"
                                      errors={errors}
                                      handleChange={handleChange}
                                      register={register}
                                      required={false}
                                      inputStyle={{ placeholder: 'user', width: '50' }}
                                    />
                                    <FormInputField
                                      fieldName="sshPassword"
                                      label="Password"
                                      errors={errors}
                                      handleChange={handleChange}
                                      register={register}
                                      required={false}
                                      inputStyle={{ placeholder: 'password', width: '50' }}
                                    />

                                    <FormCheckboxField
                                      fieldName="useSshKey"
                                      label="Use SSH Key"
                                      register={register}
                                    />
                                    {useSshKey && (
                                      <FormInputField
                                        fieldName="sshKey"
                                        label=""
                                        errors={errors}
                                        handleChange={handleChange}
                                        register={register}
                                        inputType={'file'}
                                        inputStyle={{ border: 0, width: 60 }}
                                        hasBg={false}
                                      />
                                    )}
                                  </Flex>
                                )}
                                <Flex>
                                  <FormButton
                                    navigateBack={() => router.back()}
                                    handleNextClick={handleSubmit(onSubmit)}
                                    // disabled={!(isConnectionValid && validateForm())}
                                    disabled={false}
                                    nextButtonName={'Submit'}
                                  />
                                  <Button
                                    variant={'primary'}
                                    rounded={'lg'}
                                    bg={'black.100'}
                                    p={6}
                                    fontSize={'base'}
                                    fontWeight={'semibold'}
                                    lineHeight={'base'}
                                    textColor={'white.100'}
                                    width={{ base: 'full', md: '40' }}
                                    onClick={handleTestConnection}
                                  >
                                    Test
                                  </Button>
                                </Flex>
                              </Flex>
                            </form>
                          </Flex>
                        </Box>
                      </Flex>
                    </Flex>
                  </RightContainer>
  </IntegrationContainer>
  );
};

export default MySQLIntegration;

const FormInputField = ({
  label,
  fieldName,
  register,
  errors,
  handleChange,
  required = true,
  inputType = 'text',
  inputStyle = {},
  hasBg = true,
}: {
  label: string;
  fieldName: string;
  register: any;
  errors: any;
  handleChange: Function;
  required?: boolean;
  inputType?: string;
  inputStyle?: any;
  hasBg?: boolean;
}) => {
  return (
    <Box mb={5}>
      <Text
        as={'label'}
        htmlFor={fieldName}
        fontSize={'xs-14'}
        lineHeight={'xs-14'}
        color={'grey.100'}
        display="block"
      >
        {label}
      </Text>
      <Input
        id={fieldName}
        type={inputType}
        {...register(fieldName, { required: required })}
        borderColor={errors[fieldName] ? 'red' : 'inherit'}
        focusBorderColor={errors[fieldName] ? 'red' : 'black.100'}
        {...inputStyle}
        onChange={handleChange}
        size={'lg'}
        width={{ base: 'full', md: 125 }}
        bg={hasBg ? 'white.100' : 'inherit'}
        rounded={'0.25rem'}
        fontSize={'base'}
        lineHeight={'base'}
        textColor={'black.400'}
        py={4}
        px={3.5}
        border={hasBg ? '1px' : '0px'}
        _placeholder={{
          fontSize: '1rem',
          lineHeight: '1.375rem',
          fontWeight: 400,
          color: 'grey.100',
        }}
      />
    </Box>
  );
};

const FormCheckboxField = ({
  label,
  fieldName,
  register,
}: {
  label: string;
  fieldName: string;
  register: any;
}) => {
  return (
    <Flex alignItems={'center'} gap={'2'}>
      <Text
        as={'label'}
        htmlFor={fieldName}
        fontSize={'xs-14'}
        lineHeight={'xs-14'}
        fontWeight={'500'}
        color={'grey.100'}
        display="block"
      >
        {label}
      </Text>
      <Checkbox
        id={fieldName}
        {...register(fieldName)}
        colorScheme={'radioBlack'}
      />
    </Flex>
  );
};
