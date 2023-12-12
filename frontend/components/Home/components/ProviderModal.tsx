import {
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  RadioGroup,
  SimpleGrid,
  Text,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import Plug from '@assets/icons/plug.svg';
import mixpanelLogo from '@assets/icons/mixpanel-new.svg';
import amplitudeLogo from '@assets/images/amplitude-icon.png';
import clevertapLogo from '@assets/images/clevertap-icon.png';
import appertureLogo from '@assets/images/apperture-logo-new-small.svg';
import Image from 'next/image';
import { Provider } from '@lib/domain/provider';
import IntegrationSource from '@components/IntegrationSource';
import { useRouter } from 'next/router';
import { createIntegrationWithDataSource } from '@lib/services/integrationService';

const ProviderModal = ({
  isOpen,
  onClose,
  appId,
}: {
  isOpen: boolean;
  onClose: () => void;
  appId: string;
}) => {
  const [provider, setProvider] = useState<string>('');
  const router = useRouter();

  const handleRedirect = async () => {
    if (provider === Provider.APPERTURE) {
      const integration = await createIntegrationWithDataSource(
        appId as string,
        provider,
        '',
        '',
        '',
        '',
        undefined,
        undefined,
        undefined,
        undefined,
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
      query: { appId, provider },
    });
  };
  return (
    <Modal
      isCentered
      motionPreset="slideInBottom"
      isOpen={isOpen}
      onClose={onClose}
      size={'4xl'}
    >
      <ModalOverlay opacity={'0.8 !important'} bg={'black.DEFAULT'} />
      <ModalContent width={'175'} borderRadius={'12'}>
        <ModalBody py={'8'} px={'7'}>
          <Flex direction={'column'} gap={'8'}>
            <Flex direction={'column'} alignItems={'center'} gap={'4'}>
              <Image src={Plug} width={47} height={47} />
              <Flex direction={'column'} gap={'2'}>
                <Text
                  fontSize={'sh-20'}
                  lineHeight={'sh-20'}
                  fontWeight={'600'}
                  textAlign={'center'}
                >
                  Choose a data source
                </Text>
                <Text
                  fontSize={'xs-14'}
                  lineHeight={'xs-14'}
                  fontWeight={'400'}
                >
                  To access this feature you need to connect with one of the
                  following data sources
                </Text>
              </Flex>
            </Flex>
            <RadioGroup value={provider} onChange={setProvider}>
              <SimpleGrid columns={2} columnGap={'4'} rowGap={'3'}>
                <IntegrationSource
                  sourceName="MixPanel"
                  value={Provider.MIXPANEL}
                  imgSrc={mixpanelLogo}
                  selected={provider === Provider.MIXPANEL}
                />
                <IntegrationSource
                  sourceName="Clevertap"
                  value={Provider.CLEVERTAP}
                  imgSrc={clevertapLogo}
                  selected={provider === Provider.CLEVERTAP}
                />
                <IntegrationSource
                  sourceName="Apperture"
                  value={Provider.APPERTURE}
                  imgSrc={appertureLogo}
                  selected={provider === Provider.APPERTURE}
                />

                <IntegrationSource
                  sourceName="Amplitude"
                  value={Provider.AMPLITUDE}
                  imgSrc={amplitudeLogo}
                  selected={provider === Provider.AMPLITUDE}
                />
              </SimpleGrid>
            </RadioGroup>
            <Flex justifyContent={'center'} gap={'3'}>
              <Button
                py={'6px'}
                variant={'secondary'}
                px={'4'}
                border={'1px'}
                borderRadius={'8'}
                fontSize={'xs-14'}
                lineHeight={'xs-14'}
                fontWeight={'500'}
                bg={'transparent'}
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                variant={'primary'}
                py={'6px'}
                px={'4'}
                border={'1px'}
                borderRadius={'8'}
                fontSize={'xs-14'}
                lineHeight={'xs-14'}
                fontWeight={'500'}
                textColor="white.100"
                bg="black.100"
                disabled={!provider}
                onClick={handleRedirect}
              >
                Continue
              </Button>
            </Flex>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ProviderModal;
