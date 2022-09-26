import { Item } from '@antv/g6';
import { Box } from '@chakra-ui/react';
import { AppertureContext } from '@lib/contexts/appertureContext';
import { TrendData, SankeyData } from '@lib/domain/eventData';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import { useContext, useRef } from 'react';
import EventDetailsInfo from './EventDetailsInfo';
import EventDetailsModal from './MobileEventDetailsModal';

type EventDetailsDrawerProps = {
  isEventDetailsDrawerOpen: boolean;
  closeEventDetailsDrawer: () => void;
  setSelectedNode: Function;
  selectedNode: Item | null;
  eventData: { [key in string]: Array<TrendData | SankeyData> };
  setEventData: Function;
};

const EventDetails = ({
  isEventDetailsDrawerOpen,
  closeEventDetailsDrawer,
  setSelectedNode,
  selectedNode,
  eventData,
  setEventData,
}: EventDetailsDrawerProps) => {
  const drawerRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = () => {
    closeEventDetailsDrawer();
    setSelectedNode(null);
    setEventData(null);
  };
  const context = useContext(AppertureContext);

  useOnClickOutside(drawerRef, handleClickOutside);

  return (
    <>
      {context.device.isMobile && isEventDetailsDrawerOpen ? (
        <>
          <EventDetailsModal
            isEventDetailsDrawerOpen={isEventDetailsDrawerOpen}
            closeEventDetailsDrawer={closeEventDetailsDrawer}
            eventData={eventData}
            selectedNode={selectedNode}
          />
        </>
      ) : isEventDetailsDrawerOpen && eventData ? (
        <>
          <Box
            ref={drawerRef}
            position={'fixed'}
            zIndex={'200'}
            mt={'0.15'}
            width={'106'}
            h={'full'}
            px={'7'}
            pt={'2'}
            backgroundColor={'white.DEFAULT'}
            shadow={'1px 1px 0 rgba(30, 25, 34, 0.08)'}
            overflowY={'auto'}
            animation={'ease-out 1s'}
          >
            <EventDetailsInfo
              eventData={eventData}
              selectedNode={selectedNode}
            />
          </Box>
          <Box position={'fixed'} zIndex={'100'} w={'full'} h={'full'} />
        </>
      ) : null}
    </>
  );
};

export default EventDetails;
