import {
  Box,
  Flex,
  Heading,
  IconButton,
  RadioGroup,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useRouter } from 'next/router';
import 'remixicon/fonts/remixicon.css';
import gaLogo from '@assets/images/ga-logo-small.svg';
import mixpanelLogo from '@assets/images/mixPanel-icon.png';
import amplitudeLogo from '@assets/images/amplitude-icon.png';
import clevertapLogo from '@assets/images/clevertap-icon.png';
import appertureLogo from '@assets/images/apperture-logo.svg';
import apilogo from '@assets/images/apilogo.png';
import FormButton from '@components/FormButton';
import IntegrationSource from '@components/IntegrationSource';
import { Provider } from '@lib/domain/provider';
import { createIntegrationWithDataSource } from '@lib/services/integrationService';

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
    <Flex
      flexDirection={'column'}
      h={'full'}
      py={{ base: 4, md: 10 }}
      pl={{ base: 4, md: 45 }}
      pr={{ base: 4, md: 'auto' }}
      justifyContent={{ base: 'space-between', md: 'start' }}
    >
      <Box>
        <IconButton
          aria-label="close"
          variant={'secondary'}
          icon={<i className="ri-close-fill" />}
          rounded={'full'}
          bg={'white.DEFAULT'}
          border={'1px'}
          borderColor={'white.200'}
          onClick={handleClose}
        />
        <Box width={{ base: 'full' }} maxWidth={{ md: '200' }} mt={11}>
          <Text
            textColor={'grey.200'}
            pb={6}
            fontSize={'xs-14'}
            lineHeight={'xs-14'}
            fontWeight={'medium'}
          >
            {add ? 'Step 1 of 2' : 'Step 2 of 3'}
          </Text>
          <Heading
            as={'h2'}
            pb={{ base: 8, md: 10 }}
            fontSize={{ base: 'sh-28', md: 'sh-56' }}
            lineHeight={{ base: 'sh-28', md: 'sh-56' }}
            fontWeight={'semibold'}
          >
            Select a data source
          </Heading>
          <Box width={'full'} marginBottom={'10'}>
            <RadioGroup value={provider} onChange={setProvider}>
              <Stack direction="column">
                <IntegrationSource
                  sourceName="Connect an API"
                  value={Provider.API}
                  imgSrc={apilogo}
                  selected={provider === Provider.API}
                />
                <IntegrationSource
                  sourceName="Apperture"
                  value={Provider.APPERTURE}
                  imgSrc={appertureLogo}
                  selected={provider === Provider.APPERTURE}
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
              </Stack>
            </RadioGroup>
          </Box>
        </Box>
      </Box>
      <FormButton
        navigateBack={handleGoBack}
        handleNextClick={handleNextClick}
        disabled={!provider}
        nextButtonName={'Next'}
      />
    </Flex>
  );
};

export default SelectProvider;
