import Sheet from 'react-modal-sheet';
import 'remixicon/fonts/remixicon.css';
import { OVERLAY_GRAY } from '@theme/index';
import AlertsHeader from './AlertsMobileHeader';
import { TrendData } from '@lib/domain/eventData';
import AlertsInfo from '../components/AlertsInfo';
import { useEffect, useState } from 'react';
import Loading from '../components/Loading';
import { FunnelTrendsData } from '@lib/domain/funnel';
import {
  NotificationEventsData,
  NotificationVariant,
} from '@lib/domain/notification';

type MobileAlertsProps = {
  nodeName: string;
  eventData: NotificationEventsData;
  isAlertsSheetOpen: boolean;
  closeAlertsSheet: () => void;
  variant: NotificationVariant;
  reference: string;
  datasourceId: string;
};
const MobileAlerts = ({
  nodeName,
  eventData,
  isAlertsSheetOpen,
  closeAlertsSheet,
  variant,
  reference,
  datasourceId,
}: MobileAlertsProps) => {
  const [isLoading, setIsLoading] = useState<Boolean>(true);

  useEffect(() => {
    if (eventData.length) {
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
            <Loading />
          ) : (
            <AlertsInfo
              nodeName={nodeName}
              eventData={eventData}
              closeAlertsSheet={closeAlertsSheet}
              variant={variant}
              reference={reference}
              datasourceId={datasourceId}
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
