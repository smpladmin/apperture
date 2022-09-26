import {
  Box,
  IconButton,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from '@chakra-ui/react';
import EventDetailsInfo from './EventDetailsInfo';
import { Item } from '@antv/g6';
import { SankeyData, TrendData } from '@lib/domain/eventData';

type EventDetailsModalInfoProps = {
  isEventDetailsDrawerOpen: boolean;
  closeEventDetailsDrawer: () => void;
  selectedNode: Item | null;
  eventData: { [key in string]: Array<TrendData | SankeyData> };
};

const EventDetailsModal = ({
  isEventDetailsDrawerOpen,
  closeEventDetailsDrawer,
  eventData,
  selectedNode,
}: EventDetailsModalInfoProps) => {
  return (
    <Modal
      isOpen={isEventDetailsDrawerOpen}
      onClose={closeEventDetailsDrawer}
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
              onClick={closeEventDetailsDrawer}
            />
          </Box>
        </ModalHeader>
        <ModalBody>
          <EventDetailsInfo eventData={eventData} selectedNode={selectedNode} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default EventDetailsModal;
