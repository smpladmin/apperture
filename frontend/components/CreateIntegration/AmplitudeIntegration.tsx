import {
  Box,
  chakra,
  Flex,
  Heading,
  IconButton,
  Input,
  Text,
} from '@chakra-ui/react';
import amplitudeLogo from '@assets/images/amplitude-icon.svg';
import Image from 'next/image';
import FormButton from '@components/FormButton';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { createIntegrationWithDataSource } from '@lib/services/integrationService';
import { Provider } from '@lib/domain/provider';
import logo from '@assets/images/AppertureWhiteLogo.svg';
import { CaretRight } from 'phosphor-react';
import onboarding_left_panel from '@assets/images/onboarding_left_panel.svg';
import {containerStyle, leftContainerStyle, rightContainerOuter, LeftContainerContent, rightContainerInner, TopProgress} from '@components/onboarding';

type AmplitudeIntegrationProps = {
  handleClose: Function;
  add: string | string[] | undefined;
};
const AmplitudeIntegration = ({
  add,
  handleClose,
}: AmplitudeIntegrationProps) => {
  const router = useRouter();
  const [projectId, setProjectId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [validData, setValidData] = useState(false);
  
  const handleGoBack = (): void => router.back();

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

    <Box sx={containerStyle}>
      <Box sx={leftContainerStyle}>
        <LeftContainerContent/>
      </Box>

      <Box sx={rightContainerOuter}>
        <Box sx={rightContainerInner}>
          <Flex
            flexDirection="column"
            alignItems="center"
          >
          <TopProgress handleGoBack={handleGoBack}/>
            <Flex
              direction={'column'}
              h={'full'}
              justifyContent={{ base: 'space-between', md: 'start' }}
            >
                <Box>
                  
                  <Box height={{ base: 8, md: 14 }} width={{ base: 8, md: 14 }} mb={2}>
                    <Image src={amplitudeLogo} alt="amplitude" layout="responsive" />
                  </Box>
                 
                  <Heading
                    as={'h3'}
                    mb={{ base: 8, md: 10 }}
                    fontSize={{ base: 'sh-18', md: 'sh-18' }}
                    lineHeight={{ base: '2.125rem', md: '4.125rem' }}
                    fontWeight={'semibold'}
                    maxW={200}
                  >
                    Enter Details to fetch data from Amplitude
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
            </Flex>
        </Box>
      </Box>
    </Box>
  
  );
};

export default AmplitudeIntegration;
