import {
  Box,
  chakra,
  Flex,
  Heading,
  IconButton,
  Input,
  Text,
} from '@chakra-ui/react';
import clevertapLogo from '@assets/images/clevertap-icon.png';
import Image from 'next/image';
import FormButton from '@components/FormButton';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { createIntegrationWithDataSource } from '@lib/services/integrationService';
import { Provider } from '@lib/domain/provider';

type ClevertapIntegrationProps = {
  handleClose: Function;
  add: string | string[] | undefined;
};
const ClevertapIntegration = ({
  add,
  handleClose,
}: ClevertapIntegrationProps) => {
  const router = useRouter();
  const [projectId, setProjectId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [validData, setValidData] = useState(false);

  useEffect(() => {
    setValidData(!!(projectId && apiKey && apiSecret));
  }, [projectId, apiKey, apiSecret]);

  const onSubmit = async () => {
    const appId = router.query.appId as string;
    const provider = router.query.provider as Provider;

    const integration = await createIntegrationWithDataSource(
      appId,
      provider,
      projectId,
      apiKey,
      apiSecret,
      ''
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
          <Image src={clevertapLogo} alt="clevertap" layout="responsive" />
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
          Enter Details to fetch data from Clevertap
        </Heading>
        <Box>
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
              border={'0.6px'}
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
              border={'0.6px'}
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
              border={'0.6px'}
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
          handleNextClick={() => onSubmit()}
          disabled={!validData}
          nextButtonName={add ? 'Add Data Source' : 'Create Application'}
        />
      </Box>
    </Flex>
  );
};

export default ClevertapIntegration;
