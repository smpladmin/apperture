import 'remixicon/fonts/remixicon.css';
import MobileAlerts from './MobileAlerts';
import DesktopAlerts from './DesktopAlert';
import Render from '@components/Render';
import {
  NotificationEventsData,
  NotificationVariant,
} from '@lib/domain/notification';

type AlertsProps = {
  nodeName: string;
  isAlertsSheetOpen: boolean;
  closeAlertsSheet: () => void;
  variant: NotificationVariant;
  reference: string;
  eventData: NotificationEventsData;
};
const Alert = ({
  nodeName,
  isAlertsSheetOpen,
  closeAlertsSheet,
  variant,
  reference,
  eventData,
}: AlertsProps) => {
  return (
    <>
      <Render on={'mobile'}>
        <MobileAlerts
          nodeName={nodeName}
          eventData={eventData}
          isAlertsSheetOpen={isAlertsSheetOpen}
          closeAlertsSheet={closeAlertsSheet}
          variant={variant}
          reference={reference}
        />
      </Render>
      <Render on={'desktop'}>
        <DesktopAlerts
          nodeName={nodeName}
          eventData={eventData}
          isAlertsSheetOpen={isAlertsSheetOpen}
          closeAlertsSheet={closeAlertsSheet}
          variant={variant}
          reference={reference}
        />
      </Render>
    </>
  );
};

export default Alert;
