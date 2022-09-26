import { Box } from '@chakra-ui/react';
import { AppertureContext } from '@lib/contexts/appertureContext';
import { AppWithIntegrations } from '@lib/domain/app';
import { useContext } from 'react';
import DesktopSideMenu from './DesktopSidemenu';

type SidebarProps = {
  selectedApp: AppWithIntegrations;
  openAppsModal: Function;
};

const Sidebar = ({ selectedApp, openAppsModal }: SidebarProps) => {
  const context = useContext(AppertureContext);
  return (
    <Box hidden={context.device.isMobile}>
      <DesktopSideMenu
        selectedApp={selectedApp}
        openAppsModal={openAppsModal}
      />
    </Box>
  );
};

export default Sidebar;
