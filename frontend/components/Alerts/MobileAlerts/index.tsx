import Sheet from 'react-modal-sheet';
import 'remixicon/fonts/remixicon.css';
import { OVERLAY_GRAY } from '@theme/index';
import AlertsHeader from './AlertsMobileHeader';
import { TrendData } from '@lib/domain/eventData';
import AlertsInfo from '../components/AlertsInfo';
import { useEffect, useState } from 'react';
import { Box, Flex, Skeleton } from '@chakra-ui/react';

type MobileAlertsProps = {
  nodeName: string;
  eventData: TrendData[] | [];
  isAlertsSheetOpen: boolean;
  closeAlertsSheet: () => void;
};
const MobileAlerts = ({
  nodeName,
  eventData,
  isAlertsSheetOpen,
  closeAlertsSheet,
}: MobileAlertsProps) => {
  const [isLoading, setIsLoading] = useState<Boolean>(true);

  useEffect(() => {
    if (eventData.length > 0) {
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
              <Flex direction={'column'} gap={'6'} p={'4'}>
                <Skeleton height={'12'} fadeDuration={1} bg={'white.100'} />
                <Skeleton height={'12'} fadeDuration={1} bg={'white.100'} />
                <Skeleton height={'70'} fadeDuration={1} bg={'white.100'} />
              </Flex>
            </Box>
          ) : (
            <AlertsInfo
              nodeName={nodeName}
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
