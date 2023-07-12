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
import dbLogo from '@assets/images/database-icon.png';
import Image from 'next/image';
import FormButton from '@components/FormButton';
import { useRouter } from 'next/router';
import { useState } from 'react';
import {
  createIntegrationWithDataSource,
  testDatabaseConnection,
} from '@lib/services/integrationService';
import { Provider } from '@lib/domain/provider';
import { DatabaseCredential } from '@lib/domain/integration';
import { useForm } from 'react-hook-form';

type DatabaseIntegrationProps = {
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
  sshKey: string;
};
const DatabaseIntegration = ({
  add,
  handleClose,
}: DatabaseIntegrationProps) => {
  const router = useRouter();
  const toast = useToast();
  const [isConnectionValid, setIsConnectionValid] = useState(false);

  const onSubmit = async (data: FormData) => {
    const appId = router.query.appId as string;
    const provider = router.query.provider as Provider;
    const databaseSshCredential = data.overSsh
      ? {
          server: data.sshServer,
          port: data.sshPort,
          username: data?.sshUsername,
          password: data?.sshPassword,
        }
      : null;

    const databaseCredential = {
      host: data.host,
      port: data.port,
      username: data.username,
      password: data.password,
      sshCredential: databaseSshCredential,
    };
    const integration = await createIntegrationWithDataSource(
      appId,
      provider,
      undefined,
      undefined,
      undefined,
      databaseCredential as DatabaseCredential
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
    const databaseSshCredential = data.overSsh
      ? {
          server: data.sshServer,
          port: data.sshPort,
          username: data?.sshUsername,
          password: data?.sshPassword,
        }
      : undefined;

    const databaseCredential = {
      host: data.host,
      port: data.port,
      username: data.username,
      password: data.password,
      sshCredential: databaseSshCredential,
    };
    const validConnection = await testDatabaseConnection(
      databaseCredential as DatabaseCredential
    );
    setIsConnectionValid(validConnection);
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
  // const showSshFields = watch('overSsh', false);
  const showSshFields = false;
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
    <Flex
      direction={'column'}
      py={{ base: 4, md: 10 }}
      pl={{ base: 4, md: 45 }}
      pr={{ base: 4, md: 'auto' }}
      h={'full'}
      justifyContent={{ base: 'space-between', md: 'start' }}
    >
      <Box>
        <IconButton
          mb={8}
          size={'sm'}
          aria-label="close"
          variant={'secondary'}
          icon={<chakra.i className="ri-close-fill" />}
          rounded={'full'}
          bg={'white.DEFAULT'}
          border={'1px'}
          borderColor={'white.200'}
          onClick={() => handleClose()}
        />
        <Box height={{ base: 12, md: 18 }} width={{ base: 12, md: 18 }} mb={2}>
          <Image src={dbLogo} alt="mixpanel" layout="responsive" />
        </Box>
        <Text
          textColor={'grey.200'}
          mb={2}
          fontSize={'xs-14'}
          lineHeight={'xs-14'}
          fontWeight={'medium'}
        >
          {add ? 'Step 2 of 2' : 'Step 3 of 3'}
        </Text>
        <Heading
          as={'h2'}
          mb={{ base: 8, md: 10 }}
          fontSize={{ base: '1.74rem', md: '3.5rem' }}
          lineHeight={{ base: '2.125rem', md: '4.125rem' }}
          fontWeight={'semibold'}
          maxW={200}
        >
          Enter Details to fetch data from Database
        </Heading>

        <Flex w={150}>
          <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
            <Flex direction={'column'} gap={'4'}>
              <Flex alignItems={'center'} justifyContent={'space-between'}>
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
              </Flex>
              <Flex alignItems={'center'} justifyContent={'space-between'}>
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
              </Flex>
              {/* <FormCheckboxField
                fieldName="overSsh"
                label="Over SSH"
                register={register}
              /> */}
              {showSshFields && (
                <Flex direction={'column'} gap={'4'}>
                  <Flex
                    alignItems={'flex-start'}
                    justifyContent={'space-between'}
                  >
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
                  </Flex>
                  <Flex
                    alignItems={'flex-start'}
                    justifyContent={'space-between'}
                  >
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
                  </Flex>
                  <Flex>
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
                      />
                    )}
                  </Flex>
                </Flex>
              )}
              <Flex>
                <FormButton
                  navigateBack={() => router.back()}
                  handleNextClick={handleSubmit(onSubmit)}
                  disabled={!(isConnectionValid && validateForm())}
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
                  width={{ base: 'full', md: '72' }}
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
  );
};

export default DatabaseIntegration;

const FormInputField = ({
  label,
  fieldName,
  register,
  errors,
  handleChange,
  required = true,
  inputType = 'text',
  inputStyle = {},
}: {
  label: string;
  fieldName: string;
  register: any;
  errors: any;
  handleChange: Function;
  required?: boolean;
  inputType?: string;
  inputStyle?: any;
}) => {
  return (
    <Flex alignItems={'center'} gap={'2'}>
      <Text
        as={'label'}
        htmlFor={fieldName}
        fontSize={'xs-16'}
        lineHeight={'xs-16'}
        fontWeight={'500'}
      >
        {label}
      </Text>
      <Input
        id={fieldName}
        type={inputType}
        {...register(fieldName, { required: required })}
        borderColor={errors[fieldName] ? 'red' : 'inherit'}
        focusBorderColor={errors[fieldName] ? 'red' : 'black.100'}
        borderWidth={'1px'}
        py={'1'}
        px={'2'}
        {...inputStyle}
        onChange={handleChange}
      />
    </Flex>
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
