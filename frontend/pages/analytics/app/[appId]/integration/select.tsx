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
import 'remixicon/fonts/remixicon.css';
import gaLogo from '@assets/images/ga-logo.png';
import mixpanelLogo from '@assets/images/mixPanel-icon.png';

import IntegrationSource from '@components/IntegrationSource';
import { useState } from 'react';
import { useRouter } from 'next/router';

const SelectIntegration = () => {
  const [integration, setIntegration] = useState<string>('');

  const router = useRouter();
  const { appId } = router.query;

  const handleGoBack = (): void => router.back();

  const handleClose = () => router.push('/analytics/explore?apps=1');

  return (
    <Flex
      h={{ base: '100%', lg: 'auto' }}
      flexDir={'column'}
      p={4}
      px={{ lg: 48 }}
      pt={{ lg: 20 }}
      maxW={{ base: 'full', lg: '1280px' }}
    >
      <Box>
        <IconButton
          aria-label="close"
          icon={<i className="ri-close-fill" />}
          rounded={'full'}
          bg={'white.DEFAULT'}
          border={'1px'}
          borderColor={'white.200'}
          onClick={handleClose}
        />
        <Box mt={11} w={{ sm: 'full' }} maxW={{ lg: '44rem' }}>
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
          >
            Select a data source
          </Heading>
        </Box>
        <RadioGroup value={integration} onChange={setIntegration}>
          <Stack direction="column">
            <IntegrationSource
              sourceName="Google Analytics"
              value="google"
              imgSrc={gaLogo}
              selected={integration === 'google'}
            />
            <IntegrationSource
              sourceName="MixPanel"
              value="mixpanel"
              imgSrc={mixpanelLogo}
              selected={integration === 'mixpanel'}
            />
          </Stack>
        </RadioGroup>
      </Box>

      <Flex gap={'2'} mt={'10'} w={'full'}>
        <IconButton
          aria-label="back"
          icon={<i className="ri-arrow-left-line"></i>}
          rounded={'lg'}
          bg={'white.100'}
          p={6}
          w={'13'}
          onClick={handleGoBack}
        />
        <Button
          rounded={'lg'}
          bg={'black.100'}
          p={6}
          fontSize={'base'}
          fontWeight={'semibold'}
          lineHeight={'base'}
          textColor={'white.100'}
          width={{ base: 'full', md: '72' }}
          disabled={!integration}
          onClick={() =>
            router.push(
              `/analytics/app/${appId}/integration/${encodeURIComponent(
                integration
              )}/create`
            )
          }
        >
          Next
        </Button>
      </Flex>
    </Flex>
  );
};

export default SelectIntegration;
