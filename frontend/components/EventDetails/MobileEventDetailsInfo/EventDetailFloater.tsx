import {
  Box,
  Flex,
  IconButton,
  Skeleton,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import 'remixicon/fonts/remixicon.css';
import {
  NodeSignificanceData,
  SankeyData,
  TrendData,
} from '@lib/domain/eventData';
import EventDetailsModal from './EventDetailsModal';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import { useContext, useEffect, useRef, useState } from 'react';
import { MapContext } from '@lib/contexts/mapContext';
import { Actions } from '@lib/types/context';
import { formatDatalabel, getPercentageOfHits } from '@lib/utils/common';

type EventDetailsFloaterProps = {
  eventData: {
    [key in string]: Array<TrendData | SankeyData | NodeSignificanceData>;
  };
};

const EventDetailFloater = ({ eventData }: EventDetailsFloaterProps) => {
  const { nodeSignificanceData } = eventData;
  const {
    isOpen: isEventDetailsModalOpen,
    onOpen: openEventDetailsModal,
    onClose: closeEventDetailsModal,
  } = useDisclosure();
  const eventDetailsRef = useRef<HTMLDivElement>(null);
  const { dispatch } = useContext(MapContext);

  useOnClickOutside(eventDetailsRef, () => {
    dispatch({
      type: Actions.SET_ACTIVE_NODE,
      payload: null,
    });
  });
  const [isLoading, setIsLoading] = useState<Boolean>(true);

  useEffect(() => {
    if (Object.keys(eventData).length) {
      setIsLoading(false);
    }
  }, [eventData]);

  return (
    <>
      {isLoading ? (
        <Flex
          direction={'column'}
          gap={'2'}
          p={'4'}
          bg={'white.DEFAULT'}
          border={'1px'}
          borderColor={'white.200'}
          shadow={'4px 4px 12px rgba(0, 0, 0, 0.12)'}
          rounded={'xl'}
        >
          <Skeleton height={'8'} fadeDuration={1} bg={'white.100'} />
          <Skeleton height={'6'} fadeDuration={1} bg={'white.100'} />
          <Skeleton height={'9'} fadeDuration={1} bg={'white.100'} mt={'4'} />
        </Flex>
      ) : (
        <>
          <Box
            p={'4'}
            bg={'white.DEFAULT'}
            shadow={'4px 4px 12px rgba(0, 0, 0, 0.12)'}
            rounded={'xl'}
            border={'1px'}
            borderColor={'white.200'}
            ref={!isEventDetailsModalOpen ? eventDetailsRef : null}
          >
            <Flex justifyContent={'space-between'} alignItems={'center'}>
              <Text
                fontSize={'sh-20'}
                lineHeight={'sh-20'}
                fontWeight={'medium'}
                wordBreak={'break-word'}
              >
                {(nodeSignificanceData?.[0] as NodeSignificanceData)?.['node']}
              </Text>
              <Box
                borderRadius={'25'}
                bg={'white.200'}
                color={'black.100'}
                fontSize={'xs-12'}
                fontWeight={'600'}
                px={'2'}
                py={'1'}
                h={'8'}
              >
                Event
              </Box>
            </Flex>
            <Text
              fontSize={'xs-14'}
              lineHeight={'base'}
              fontWeight={'normal'}
              color={'grey.200'}
              mt={'2'}
            >
              {`${getPercentageOfHits(
                (nodeSignificanceData?.[0] as NodeSignificanceData)?.[
                  'nodeHits'
                ],
                (nodeSignificanceData?.[0] as NodeSignificanceData)?.[
                  'totalHits'
                ]
              )}% of overall traffic on this event`}
            </Text>
            <Flex
              mt={'6'}
              justifyContent={'space-between'}
              alignItems={'center'}
            >
              <Flex alignItems={'baseline'} gap={'1'}>
                <Text
                  fontSize={'sh-28'}
                  fontWeight={'700'}
                  lineHeight={'sh-28'}
                  fontFamily={'Space Grotesk, Work Sans, sans-serif'}
                >
                  {formatDatalabel(
                    (nodeSignificanceData?.[0] as NodeSignificanceData)?.[
                      'nodeHits'
                    ]
                  )}
                </Text>
                <Text
                  fontSize={'xs-12'}
                  fontWeight={'medium'}
                  lineHeight={'xs-12'}
                >
                  Hits
                </Text>
              </Flex>
              <IconButton
                aria-label="next"
                icon={<i className="ri-arrow-right-s-line"></i>}
                color={'white.DEFAULT'}
                bg={'black.100'}
                size={'sm'}
                rounded={'full'}
                onClick={openEventDetailsModal}
              />
            </Flex>
          </Box>
          <EventDetailsModal
            isEventDetailsModalOpen={isEventDetailsModalOpen}
            closeEventDetailsModal={closeEventDetailsModal}
            eventData={eventData}
          />
        </>
      )}
    </>
  );
};

export default EventDetailFloater;
