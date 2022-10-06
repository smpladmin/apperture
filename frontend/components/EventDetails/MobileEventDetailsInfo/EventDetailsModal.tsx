import {
  Box,
  IconButton,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from '@chakra-ui/react';
import EventDetailsInfo from '../EventDetailsInfo';
import {
  NodeSignificanceData,
  SankeyData,
  TrendData,
} from '@lib/domain/eventData';
import { useContext } from 'react';
import { MapContext } from '@lib/contexts/mapContext';
import { Actions } from '@lib/types/context';

type EventDetailsModalInfoProps = {
  isEventDetailsDrawerOpen: boolean;
  closeEventDetailsDrawer: () => void;
  eventData: {
    [key in string]: Array<TrendData | SankeyData | NodeSignificanceData>;
  };
};

const EventDetailsModal = ({
  isEventDetailsDrawerOpen,
  closeEventDetailsDrawer,
  eventData,
}: EventDetailsModalInfoProps) => {
  const { dispatch } = useContext(MapContext);

  const handleCloseModal = () => {
    dispatch({
      type: Actions.SET_ACTIVE_NODE,
      payload: null,
    });
    closeEventDetailsDrawer();
  };

  return (
    <Modal
      isOpen={isEventDetailsDrawerOpen}
      onClose={handleCloseModal}
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
              onClick={handleCloseModal}
            />
          </Box>
        </ModalHeader>
        <ModalBody>
          <EventDetailsInfo eventData={eventData} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default EventDetailsModal;
