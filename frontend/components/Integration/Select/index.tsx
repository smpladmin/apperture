import {
  Box,
  Flex,
  Heading,
  IconButton,
  RadioGroup,
  Text,
  SimpleGrid,
  Button,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import 'remixicon/fonts/remixicon.css';
import gaLogo from '@assets/images/ga-logo-small.svg';
import mixpanelLogo from '@assets/images/mixPanel-icon.png';
import amplitudeLogo from '@assets/images/amplitude-icon.png';
import clevertapLogo from '@assets/images/clevertap-icon.png';
import appertureLogo from '@assets/images/apperture-logo.svg';
import apilogo from '@assets/images/apilogo.png';
import mysqlLogo from '@assets/images/mysql-icon.png';
import IntegrationSource from '@components/IntegrationSource';
import { Provider } from '@lib/domain/provider';
import { createIntegrationWithDataSource } from '@lib/services/integrationService';
import { FileArrowUp, CaretRight } from 'phosphor-react';
import {
  containerStyle,
  leftContainerStyle,
  rightContainerOuter,
  LeftContainerContent,
  rightContainerInner,
  TopProgress,
} from '@components/onboarding';

const SelectProvider = () => {
  const [provider, setProvider] = useState<string>('');
  const router = useRouter();
  const { appId, add, previousDsId } = router.query;

  const handleGoBack = (): void => router.back();

  const handleClose = () =>
    router.push({
      pathname: `/analytics/home/[dsId]`,
      query: { dsId: previousDsId, apps: 1 },
    });

  const handleNextClick = async () => {
    const queryParams = { appId, provider, ...router.query };

    if (provider === Provider.APPERTURE) {
      const integration = await createIntegrationWithDataSource(
        appId as string,
        provider,
        '',
        '',
        '',
        '',
        undefined,
        { params: { create_datasource: true, trigger_data_processor: false } }
      );
      router.push({
        pathname: '/analytics/app/[appId]/integration/[provider]/complete',
        query: {
          appId,
          provider,
          dsId: integration.datasource._id,
        },
      });
      return;
    }
    router.push({
      pathname: `/analytics/app/[appId]/integration/[provider]/create`,
      query: queryParams,
    });
  };

  return (
    <Box sx={containerStyle}>
      <Box sx={leftContainerStyle}>
        <LeftContainerContent />
      </Box>

      <Box sx={rightContainerOuter}>
        <Box sx={rightContainerInner}>
          <Flex flexDirection="column" alignItems="center">
            <TopProgress handleGoBack={handleGoBack} />

            <Box width={120} mt={10}>
              <Heading
                as="h3"
                fontSize="sh-24"
                fontWeight="bold"
                mb={3}
                textAlign="center"
              >
                Connect to a datasource
              </Heading>
              <Text
                fontSize={'xs-12'}
                textAlign="center"
                color="grey.500"
                fontWeight="normal"
              >
                Choose from our list of connectors, or just upload a CSV file{' '}
              </Text>
            </Box>

            <Box
              borderWidth="1px"
              borderColor="gray.300"
              borderRadius={'20'}
              rounded="md"
              p={4}
              display="flex"
              alignItems="center"
              mt={10}
            >
              <FileArrowUp size={30} color="#212121" />
              <Box flex="1" minW="150" pl={2}>
                <Text fontSize="xs-14" fontWeight="semibold" color="gray.900">
                  Upload a CSV
                </Text>
                <Text fontSize="xs-10" color="gray.500">
                  Select a file to upload
                </Text>
              </Box>
              <IconButton
                aria-label="Go back"
                icon={<CaretRight size={14} />}
                color="grey.900"
                fontWeight="100"
                bg="white"
                _hover={{
                  bg: 'white',
                }}
              />
            </Box>

            <Box width={'80%'} mb={'10'} mt="10">
              <RadioGroup value={provider} onChange={setProvider}>
                <SimpleGrid columns={4} spacing={2}>
                  <IntegrationSource
                    sourceName="Apperture"
                    value={Provider.APPERTURE}
                    imgSrc={appertureLogo}
                    selected={provider === Provider.APPERTURE}
                  />
                  <IntegrationSource
                    sourceName="MySQL"
                    value={Provider.MYSQL}
                    imgSrc={mysqlLogo}
                    selected={provider === Provider.MYSQL}
                  />
                  <IntegrationSource
                    sourceName="MixPanel"
                    value={Provider.MIXPANEL}
                    imgSrc={mixpanelLogo}
                    selected={provider === Provider.MIXPANEL}
                  />
                  <IntegrationSource
                    sourceName="Amplitude"
                    value={Provider.AMPLITUDE}
                    imgSrc={amplitudeLogo}
                    selected={provider === Provider.AMPLITUDE}
                  />
                  <IntegrationSource
                    sourceName="Clevertap"
                    value={Provider.CLEVERTAP}
                    imgSrc={clevertapLogo}
                    selected={provider === Provider.CLEVERTAP}
                  />
                  <IntegrationSource
                    sourceName="Google Analytics"
                    value={Provider.GOOGLE}
                    imgSrc={gaLogo}
                    selected={provider === Provider.GOOGLE}
                  />
                  <IntegrationSource
                    sourceName="Connect an API"
                    value={Provider.API}
                    imgSrc={apilogo}
                    selected={provider === Provider.API}
                  />
                </SimpleGrid>
              </RadioGroup>
            </Box>

            <Button
              variant="primary"
              mt={6}
              rounded="lg"
              bg="white"
              p={6}
              fontSize="base"
              fontWeight="semibold"
              lineHeight="base"
              textColor="grey.900"
              textDecoration="underline"
              width={{ base: 'full', md: '72' }}
              _hover={{
                bg: 'white',
              }}
            >
              Explore a Sample Dataset
            </Button>

            <Button
              data-testid={'next-button'}
              variant="primary"
              mt={6}
              mb={1}
              rounded="lg"
              bg="black.100"
              p={6}
              fontSize="base"
              fontWeight="semibold"
              lineHeight="base"
              textColor="white.100"
              width={{ base: 'full', md: '72' }}
              disabled={!provider}
              onClick={handleNextClick}
            >
              Next
            </Button>
          </Flex>
        </Box>
      </Box>
    </Box>



    <Box width={'80%'} mb={'10'} mt="10" >
           <RadioGroup value={provider} onChange={setProvider}>
            <SimpleGrid columns={4} spacing={2}>
              <IntegrationSource sourceName="Apperture" value={Provider.APPERTURE} imgSrc={appertureLogo} selected={provider === Provider.APPERTURE} />
              <IntegrationSource sourceName="MySQL" value={Provider.MYSQL} imgSrc={mysqlLogo} selected={provider === Provider.MYSQL} />
              <IntegrationSource sourceName="MixPanel" value={Provider.MIXPANEL} imgSrc={mixpanelLogo} selected={provider === Provider.MIXPANEL} />
              <IntegrationSource sourceName="Amplitude" value={Provider.AMPLITUDE} imgSrc={amplitudeLogo} selected={provider === Provider.AMPLITUDE} />
              <IntegrationSource sourceName="Clevertap" value={Provider.CLEVERTAP} imgSrc={clevertapLogo} selected={provider === Provider.CLEVERTAP} />
              <IntegrationSource sourceName="Google Analytics" value={Provider.GOOGLE} imgSrc={gaLogo} selected={provider === Provider.GOOGLE} />
              <IntegrationSource sourceName="Connect an API" value={Provider.API} imgSrc={apilogo} selected={provider === Provider.API} />
            </SimpleGrid>
          </RadioGroup>
    </Box>


        <Button
          variant="primary"
          mt={6}
          rounded="lg"
          bg="white"
          p={6}
          fontSize="base"
          fontWeight="semibold"
          lineHeight="base"
          textColor="grey.900"
          textDecoration="underline"
          width={{ base: 'full', md: '72' }}
          _hover={{
            bg: 'white', // Change hover color to white
          }}
          // onClick={handleNextClick}
        >
          Explore a Sample Dataset
        </Button>


        <Button
          variant="primary"
          mt={6}
          mb={1}
          rounded="lg"
          bg="black.100"
          p={6}
          fontSize="base"
          fontWeight="semibold"
          lineHeight="base"
          textColor="white.100"
          width={{ base: 'full', md: '72' }}
          disabled={!provider}
          onClick={handleNextClick}
        >
          Next
        </Button>


      </Flex>
    </Box>
    </Box>
    </Box>


  );
};

export default SelectProvider;
