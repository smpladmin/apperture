import {
  Box,
  Button,
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
import { Providers } from '@lib/constants';
import FormButton from '@components/FormButton';
import IntegrationSource from '@components/IntegrationSource';

const SelectIntegration = () => {
  const [integration, setIntegration] = useState<string>('');
  const router = useRouter();
  const { appId } = router.query;

  const handleGoBack = (): void => router.back();

  const handleClose = () => router.push('/analytics/explore?apps=1');

  const handleNextClick = () =>
    router.push(
      `/analytics/app/${appId}/integration/${encodeURIComponent(
        integration
      )}/create`
    );
  return (
    <Flex direction={'column'}>
      <IconButton
        aria-label="close"
        icon={<i className="ri-close-fill" />}
        rounded={'full'}
        bg={'white.DEFAULT'}
        border={'1px'}
        borderColor={'white.200'}
        onClick={handleClose}
        top={{ base: '4', md: '20' }}
        left={{ base: '4', md: '45' }}
        position={'absolute'}
      />
      <Box
        top={{ base: '22', md: '40' }}
        left={{ base: '4', md: '45' }}
        width={{ base: 'full' }}
        paddingRight={{ base: '4' }}
        maxWidth={{ lg: '200' }}
        position={'absolute'}
      >
        <Text
          textColor={'grey.200'}
          pb={6}
          fontSize={'xs-14'}
          lineHeight={'xs-14'}
          fontWeight={'medium'}
        >
          Step 2 of 3
        </Text>
        <Heading
          as={'h2'}
          pb={{ base: 8, lg: 10 }}
          fontSize={{ base: '1.74rem', lg: '3.5rem' }}
          lineHeight={{ base: '2.125rem', lg: '4.125rem' }}
          fontWeight={'semibold'}
        >
          Select a data source
        </Heading>
        <Box width={'full'} marginBottom={'10'}>
          <RadioGroup value={integration} onChange={setIntegration}>
            <Stack direction="column">
              <IntegrationSource
                sourceName="Google Analytics"
                value="google"
                imgSrc={gaLogo}
                selected={integration === Providers.Google}
              />
              <IntegrationSource
                sourceName="MixPanel"
                value="mixpanel"
                imgSrc={mixpanelLogo}
                selected={integration === Providers.Mixpanel}
              />
            </Stack>
          </RadioGroup>
        </Box>
        <FormButton
          navigateBack={handleGoBack}
          handleNextClick={handleNextClick}
          disabled={!integration}
        />
      </Box>
    </Flex>
  );
};

export default SelectIntegration;
