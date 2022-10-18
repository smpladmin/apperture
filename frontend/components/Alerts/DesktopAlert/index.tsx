import {
  Box,
  Divider,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import { TrendData } from '@lib/domain/eventData';

import AlertsInfo from '../components/AlertsInfo';

type DesktopAlertsProps = {
  nodeName: string;
  eventData: TrendData[] | [];
  isAlertsSheetOpen: boolean;
  closeAlertsSheet: () => void;
};

const DesktopAlerts = ({
  nodeName,
  eventData,
  isAlertsSheetOpen,
  closeAlertsSheet,
}: DesktopAlertsProps) => {
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
        <ModalBody px={'9'} pt={'4'} pb={'9'} overflowY={'auto'}>
          <AlertsInfo
            nodeName={nodeName}
            eventData={eventData}
            closeAlertsSheet={closeAlertsSheet}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default DesktopAlerts;
