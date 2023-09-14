import mysqlLogo from '@assets/images/mysql-icon.png';
import {
  Box,
  Button,
  Checkbox,
  Flex,
  Heading,
  Input,
  Radio,
  RadioGroup,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react';
import FormButton from '@components/FormButton';
import {
  IntegrationContainer,
  LeftContainer,
  LeftContainerRevisit,
  RightContainer,
  TopProgress,
} from '@components/Onboarding';
import {
  DatabaseCredential,
  RelationalDatabaseType,
} from '@lib/domain/integration';
import { Provider } from '@lib/domain/provider';
import {
  createIntegrationWithDataSource,
  testDatabaseConnection,
} from '@lib/services/integrationService';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

type MySQLIntegrationProps = {
  handleClose: Function;
  add: string | string[] | undefined;
};

type FormData = {
  host: string;
  port: string;
  username: string;
  password: string;
  databases: string;
  table: string;
  overSsh: boolean;
  sshServer: string;
  sshPort: string;
  sshUsername: string;
  sshPassword: string;
  useSshKey: boolean;
  sshKey: FileList;
  databaseType: RelationalDatabaseType;
};
const MySQLIntegration = ({ add, handleClose }: MySQLIntegrationProps) => {
  const router = useRouter();
  const handleGoBack = (): void => router.back();
  const toast = useToast();
  const [isConnectionValid, setIsConnectionValid] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const stringToList = (inputString: string): string[] => {
    const stringArray = inputString.split(',');
    const trimmedArray = stringArray.map((item) => item.trim());
    return trimmedArray;
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

    const databaseCredential = {
      host: data.host,
      port: data.port,
      username: data.username,
      password: data.password,
      databases: stringToList(data.databases),
      overSsh: data.overSsh,
      databaseType: data.databaseType,
      sshCredential: databaseSshCredential,
    };

    return databaseCredential;
  };

  const onSubmit = async (data: FormData) => {
    const appId = router.query.appId as string;
    const databaseCredential = await processFormData(data);
    const provider =
      databaseCredential.databaseType === RelationalDatabaseType.MSSQL
        ? Provider.MSSQL
        : Provider.MYSQL;
    const integration = await createIntegrationWithDataSource(
      appId,
      provider,
      undefined,
      undefined,
      undefined,
      data.table,
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
    setLoading(true);
    const databaseCredential = await processFormData(data);
    const validConnection = await testDatabaseConnection(
      databaseCredential as DatabaseCredential
    );
    // setIsConnectionValid(validConnection);
    setIsConnectionValid(true);
    setLoading(false);
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
      databases: '',
      table: '',
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
      watch('host') &&
        watch('port') &&
        watch('username') &&
        watch('password') &&
        watch('databases')
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
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  style={{ width: '100%' }}
                >
                  <Flex direction={'column'} gap={'4'}>
                    <Flex direction={'column'} gap={'2'} mb={'2'}>
                      <Text
                        as={'label'}
                        fontSize={'xs-14'}
                        lineHeight={'xs-14'}
                        color={'grey.100'}
                        display="block"
                        htmlFor={'databaseType'}
                      >
                        Database Type:
                      </Text>
                      <RadioGroup
                        id={'databaseType'}
                        defaultValue={RelationalDatabaseType.MYSQL}
                        fontSize={'xs-14'}
                        lineHeight={'xs-14'}
                        colorScheme={'radioBlack'}
                      >
                        <Stack spacing={4} direction="row">
                          <Radio value="MYSQL" {...register('databaseType')}>
                            MYSQL
                          </Radio>
                          <Radio value="MSSQL" {...register('databaseType')}>
                            MSSQL
                          </Radio>
                        </Stack>
                      </RadioGroup>
                    </Flex>
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
                    <FormInputField
                      fieldName="databases"
                      label="Databases"
                      errors={errors}
                      handleChange={handleChange}
                      register={register}
                      inputStyle={{ placeholder: 'databases', width: '50' }}
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
                          inputStyle={{
                            placeholder: '192.168.1.1',
                            width: '60',
                          }}
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
                        isLoading={loading}
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
