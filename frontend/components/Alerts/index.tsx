import { TrendData } from '@lib/domain/eventData';
import 'remixicon/fonts/remixicon.css';
import MobileAlerts from './MobileAlerts';
import { useContext, useEffect, useState } from 'react';
import { AppertureContext } from '@lib/contexts/appertureContext';
import DesktopAlerts from './DesktopAlert';
import { getTrendsData } from '@lib/services/datasourceService';
import { useRouter } from 'next/router';
import { Box } from '@chakra-ui/react';

type AlertsProps = {
  nodeName: string;
  isAlertsSheetOpen: boolean;
  closeAlertsSheet: () => void;
};
const Alert = ({
  nodeName,
  isAlertsSheetOpen,
  closeAlertsSheet,
}: AlertsProps) => {
  const context = useContext(AppertureContext);
  const [dailyTrendData, setDailyTrendData] = useState<TrendData[] | []>([]);
  const router = useRouter();
  const { dsId } = router.query;

  useEffect(() => {
    const fetchTrendsData = async () => {
      setDailyTrendData(await getTrendsData(dsId as string, nodeName, 'date'));
    };
    fetchTrendsData();
  }, [nodeName]);

  return (
    <>
      {context.device.isMobile ? (
        <MobileAlerts
          nodeName={nodeName}
          eventData={dailyTrendData}
          isAlertsSheetOpen={isAlertsSheetOpen}
          closeAlertsSheet={closeAlertsSheet}
        />
      ) : (
        <DesktopAlerts
          nodeName={nodeName}
          eventData={dailyTrendData}
          isAlertsSheetOpen={isAlertsSheetOpen}
          closeAlertsSheet={closeAlertsSheet}
        />
      )}
    </>
  );
};

export default Alert;
