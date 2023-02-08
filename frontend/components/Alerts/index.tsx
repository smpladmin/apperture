import 'remixicon/fonts/remixicon.css';
import MobileAlerts from './MobileAlerts';
import DesktopAlerts from './DesktopAlert';
import Render from '@components/Render';
import {
  NotificationEventsData,
  Notifications,
  NotificationVariant,
} from '@lib/domain/notification';

type AlertsProps = {
  name: string;
  isAlertsSheetOpen: boolean;
  closeAlertsSheet: () => void;
  variant: NotificationVariant;
  reference: string;
  eventData: NotificationEventsData;
  datasourceId: string;
  savedAlert?: Notifications;
};
const Alert = ({
  name,
  isAlertsSheetOpen,
  closeAlertsSheet,
  variant,
  reference,
  eventData,
  datasourceId,
  savedAlert,
}: AlertsProps) => {
  return (
    <>
      <Render on={'mobile'}>
        <MobileAlerts
          name={name}
          eventData={eventData}
          isAlertsSheetOpen={isAlertsSheetOpen}
          closeAlertsSheet={closeAlertsSheet}
          variant={variant}
          reference={reference}
          datasourceId={datasourceId}
          savedAlert={savedAlert}
        />
      </Render>
      <Render on={'desktop'}>
        <DesktopAlerts
          name={name}
          eventData={eventData}
          isAlertsSheetOpen={isAlertsSheetOpen}
          closeAlertsSheet={closeAlertsSheet}
          variant={variant}
          reference={reference}
          datasourceId={datasourceId}
          savedAlert={savedAlert}
        />
      </Render>
    </>
  );
};

export default Alert;
