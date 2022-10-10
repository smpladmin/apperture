import { Box } from '@chakra-ui/react';
import { AppertureContext } from '@lib/contexts/appertureContext';
import { MapContext } from '@lib/contexts/mapContext';
import { TrendData, SankeyData } from '@lib/domain/eventData';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import { Actions } from '@lib/types/context';
import { useContext, useRef } from 'react';
import EventDetailFloater from './MobileEventDetailsInfo/EventDetailFloater';
import EventDetailsInfo from './EventDetailsInfo';
import EventDetailsModal from './MobileEventDetailsInfo/EventDetailsModal';

type EventDetailsProps = {
  isEventDetailsDrawerOpen: boolean;
  closeEventDetailsDrawer: () => void;
  isMobileEventDetailFloaterOpen: boolean;
  eventData: { [key in string]: Array<TrendData | SankeyData> };
  setEventData: Function;
};

const EventDetails = ({
  isEventDetailsDrawerOpen,
  closeEventDetailsDrawer,
  eventData,
  setEventData,
  isMobileEventDetailFloaterOpen,
}: EventDetailsProps) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const { dispatch } = useContext(MapContext);

  const handleClickOutside = () => {
    closeEventDetailsDrawer();
    dispatch({
      type: Actions.SET_ACTIVE_NODE,
      payload: null,
    });
    setEventData({});
  };

  const context = useContext(AppertureContext);
  useOnClickOutside(drawerRef, handleClickOutside);

  return (
    <>
      {context.device.isMobile ? (
        isMobileEventDetailFloaterOpen && (
          <Box
            w={'full'}
            px={'3'}
            pb={'3'}
            position={'fixed'}
            zIndex={'200'}
            bottom={0}
          >
            <EventDetailFloater eventData={eventData} />
          </Box>
        )
      ) : isEventDetailsDrawerOpen ? (
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
            <EventDetailsInfo eventData={eventData} />
          </Box>
        </>
      ) : null}
    </>
  );
};

export default EventDetails;
