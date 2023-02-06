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
  Notifications,
  NotificationVariant,
} from '@lib/domain/notification';

type MobileAlertsProps = {
  name: string;
  eventData: NotificationEventsData;
  isAlertsSheetOpen: boolean;
  closeAlertsSheet: () => void;
  variant: NotificationVariant;
  reference: string;
  datasourceId: string;
  savedAlert?: Notifications;
};
const MobileAlerts = ({
  name,
  eventData,
  isAlertsSheetOpen,
  closeAlertsSheet,
  variant,
  reference,
  datasourceId,
  savedAlert,
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
      data-testid="alerts-container"
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
              name={name}
              eventData={eventData}
              closeAlertsSheet={closeAlertsSheet}
              variant={variant}
              reference={reference}
              datasourceId={datasourceId}
              savedAlert={savedAlert}
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
