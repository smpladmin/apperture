import Sheet from 'react-modal-sheet';

import 'remixicon/fonts/remixicon.css';

import { OVERLAY_GRAY } from '@theme/index';
import AlertsHeader from './AlertsMobileHeader';
import {
  NodeSignificanceData,
  SankeyData,
  TrendData,
} from '@lib/domain/eventData';
import Alerts from '../AlertsInfo';

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
          <Alerts eventData={eventData} closeAlertsSheet={closeAlertsSheet} />
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
