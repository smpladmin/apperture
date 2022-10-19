import Sheet from 'react-modal-sheet';

import 'remixicon/fonts/remixicon.css';

import { OVERLAY_GRAY } from '@theme/index';
import AlertsHeader from './AlertsMobileHeader';
import {
  NodeSignificanceData,
  SankeyData,
  TrendData,
} from '@lib/domain/eventData';
import AlertsInfo from '../components/AlertsInfo';
import { useEffect, useState } from 'react';
import { Box, Flex, Skeleton } from '@chakra-ui/react';

type MobileAlertsProps = {
  eventData: {
    [key in string]: Array<TrendData | SankeyData | NodeSignificanceData>;
  };
  isAlertsSheetOpen: boolean;
  closeAlertsSheet: () => void;
};
const MobileAlerts = ({
  eventData,
  isAlertsSheetOpen,
  closeAlertsSheet,
}: MobileAlertsProps) => {
  const [isLoading, setIsLoading] = useState<Boolean>(true);

  useEffect(() => {
    if (Object.keys(eventData).length) {
      setIsLoading(false);
    }
  }, [eventData]);

  return (
    <Sheet
      isOpen={isAlertsSheetOpen}
      onClose={closeAlertsSheet}
      disableDrag={true}
      detent="content-height"
    >
      <Sheet.Container style={{ borderRadius: '1rem 1rem 0 0' }}>
        <Sheet.Header>
          <AlertsHeader closeAlertsSheet={closeAlertsSheet} />
        </Sheet.Header>
        <Sheet.Content>
          {isLoading ? (
            <Box>
              <Flex direction={'column'} gap={'4'}>
                <Skeleton height={'12'} fadeDuration={1} bg={'white.100'} />
                <Skeleton height={'12'} fadeDuration={1} bg={'white.100'} />
                <Skeleton height={'70'} fadeDuration={1} bg={'white.100'} />
              </Flex>
            </Box>
          ) : (
            <AlertsInfo
              eventData={eventData}
              closeAlertsSheet={closeAlertsSheet}
            />
          )}
        </Sheet.Content>
      </Sheet.Container>
      <Sheet.Backdrop
        style={{
          background: OVERLAY_GRAY,
          backdropFilter: 'blur(20px)',
        }}
      />
    </Sheet>
  );
};

export default MobileAlerts;
