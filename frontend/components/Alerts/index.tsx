import {
  NodeSignificanceData,
  SankeyData,
  TrendData,
} from '@lib/domain/eventData';
import 'remixicon/fonts/remixicon.css';
import MobileAlerts from './MobileAlerts';
import { useContext } from 'react';
import { AppertureContext } from '@lib/contexts/appertureContext';
import DesktopAlerts from './DesktopAlert';

type AlertsProps = {
  eventData: {
    [key in string]: Array<TrendData | SankeyData | NodeSignificanceData>;
  };
  isAlertsSheetOpen: boolean;
  closeAlertsSheet: () => void;
};
const Alert = ({
  eventData,
  isAlertsSheetOpen,
  closeAlertsSheet,
}: AlertsProps) => {
  const context = useContext(AppertureContext);
  return (
    <>
      {context.device.isMobile ? (
        <MobileAlerts
          eventData={eventData}
          isAlertsSheetOpen={isAlertsSheetOpen}
          closeAlertsSheet={closeAlertsSheet}
        />
      ) : (
        <DesktopAlerts
          eventData={eventData}
          isAlertsSheetOpen={isAlertsSheetOpen}
          closeAlertsSheet={closeAlertsSheet}
        />
      )}
    </>
  );
};

export default Alert;
