import {
  Divider,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import Loading from '../components/Loading';
import { TrendData } from '@lib/domain/eventData';
import { useEffect, useState } from 'react';
import AlertsInfo from '../components/AlertsInfo';
import {
  NotificationEventsData,
  NotificationVariant,
} from '@lib/domain/notification';

type DesktopAlertsProps = {
  name: string;
  eventData: NotificationEventsData;
  isAlertsSheetOpen: boolean;
  closeAlertsSheet: () => void;
  variant: NotificationVariant;
  reference: string;
  datasourceId: string;
};

const DesktopAlerts = ({
  name,
  eventData,
  isAlertsSheetOpen,
  closeAlertsSheet,
  variant,
  reference,
  datasourceId,
}: DesktopAlertsProps) => {
  const [isLoading, setIsLoading] = useState<Boolean>(true);

  useEffect(() => {
    if (eventData.length) {
      setIsLoading(false);
    }
  }, [eventData]);
  return (
    <Modal
      isOpen={isAlertsSheetOpen}
      onClose={closeAlertsSheet}
      isCentered
      blockScrollOnMount={false}
      trapFocus={false}
    >
      <ModalOverlay backdropFilter={'blur(20px)'} bg={'grey.0'} />
      <ModalContent
        maxWidth="168"
        maxHeight={'calc(100% - 50px)'}
        borderRadius={'20px'}
        data-testid="alerts-container"
      >
        <ModalHeader
          display={'flex'}
          justifyContent={'space-between'}
          alignItems={'center'}
          fontSize={'sh-24'}
          lineHeight={'sh-24'}
          pt={'7'}
          pb={'5'}
          px={'9'}
        >
          Alert Me
          <ModalCloseButton
            position={'relative'}
            top={0}
            right={0}
            border={'1px'}
            borderColor={'white.200'}
            rounded={'full'}
          />
        </ModalHeader>
        <Divider
          orientation="horizontal"
          borderColor={'white.200'}
          opacity={1}
        />
        <ModalBody px={'9'} pt={'4'} pb={'4'} overflowY={'auto'}>
          {isLoading ? (
            <Loading />
          ) : (
            <AlertsInfo
              name={name}
              eventData={eventData}
              closeAlertsSheet={closeAlertsSheet}
              variant={variant}
              reference={reference}
              datasourceId={datasourceId}
            />
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default DesktopAlerts;
