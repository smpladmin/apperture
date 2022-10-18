import {
  Box,
  IconButton,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from '@chakra-ui/react';
import {
  NodeSignificanceData,
  SankeyData,
  TrendData,
} from '@lib/domain/eventData';

import AlertsInfo from '../components/AlertsInfo';

type DesktopAlertsProps = {
  eventData: {
    [key in string]: Array<TrendData | SankeyData | NodeSignificanceData>;
  };
  isAlertsSheetOpen: boolean;
  closeAlertsSheet: () => void;
};

const DesktopAlerts = ({
  isAlertsSheetOpen,
  closeAlertsSheet,
  eventData,
}: DesktopAlertsProps) => {
  return (
    <Modal
      isOpen={isAlertsSheetOpen}
      onClose={closeAlertsSheet}
      isCentered
      blockScrollOnMount={false}
      trapFocus={false}
    >
      <ModalContent
        h={'full'}
        rounded={0}
        maxWidth={'full'}
        maxHeight={'full'}
        pt={0}
        marginY={0}
        overflowY={'auto'}
      >
        <ModalHeader
          display={'flex'}
          w={'full'}
          flexDirection={'column'}
          gap={'3'}
          px={'4'}
          pb={0}
        >
          <Box>
            <IconButton
              aria-label="close"
              variant={'secondary'}
              icon={<i className="ri-arrow-left-line"></i>}
              rounded={'full'}
              bg={'white.DEFAULT'}
              border={'1px'}
              borderColor={'white.200'}
              onClick={closeAlertsSheet}
            />
          </Box>
        </ModalHeader>
        <ModalBody>
          <AlertsInfo
            eventData={eventData}
            closeAlertsSheet={closeAlertsSheet}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default DesktopAlerts;
