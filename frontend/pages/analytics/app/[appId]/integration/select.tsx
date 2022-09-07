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
import FormButton from '@components/FormButton';
import IntegrationSource from '@components/IntegrationSource';
import { Provider } from '@lib/domain/provider';

const SelectProvider = () => {
  const [provider, setProvider] = useState<string>('');
  const router = useRouter();
  const { appId } = router.query;

  const handleGoBack = (): void => router.back();

  const handleClose = () => router.push('/analytics/explore?apps=1');

  const handleNextClick = () =>
    router.push({
      pathname: `/analytics/app/[appId]/integration/[provider]/create`,
      query: { appId, provider },
    });
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
        <Box width={{ base: 'full' }} maxWidth={{ lg: '200' }} mt={11}>
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
            <RadioGroup value={provider} onChange={setProvider}>
              <Stack direction="column">
                <IntegrationSource
                  sourceName="Google Analytics"
                  value={Provider.GOOGLE}
                  imgSrc={gaLogo}
                  selected={provider === Provider.GOOGLE}
                />
                <IntegrationSource
                  sourceName="MixPanel"
                  value={Provider.MIXPANEL}
                  imgSrc={mixpanelLogo}
                  selected={provider === Provider.MIXPANEL}
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
