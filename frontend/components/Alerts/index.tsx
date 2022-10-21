import { TrendData } from '@lib/domain/eventData';
import 'remixicon/fonts/remixicon.css';
import MobileAlerts from './MobileAlerts';
import { useEffect, useState } from 'react';
import DesktopAlerts from './DesktopAlert';
import { getTrendsData } from '@lib/services/datasourceService';
import { useRouter } from 'next/router';
import Render from '@components/Render';

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
  const [dailyTrendData, setDailyTrendData] = useState<TrendData[]>([]);
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
      <Render on={'mobile'}>
        <MobileAlerts
          nodeName={nodeName}
          eventData={dailyTrendData}
          isAlertsSheetOpen={isAlertsSheetOpen}
          closeAlertsSheet={closeAlertsSheet}
        />
      </Render>
      <Render on={'desktop'}>
        <DesktopAlerts
          nodeName={nodeName}
          eventData={dailyTrendData}
          isAlertsSheetOpen={isAlertsSheetOpen}
          closeAlertsSheet={closeAlertsSheet}
        />
      </Render>
    </>
  );
};

export default Alert;
