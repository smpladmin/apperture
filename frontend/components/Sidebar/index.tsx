import Render from '@components/Render';
import { AppWithIntegrations } from '@lib/domain/app';
import DesktopSideMenu from './DesktopSidemenu';

type SidebarProps = {
  selectedApp: AppWithIntegrations;
  openAppsModal: Function;
};

const Sidebar = ({ selectedApp, openAppsModal }: SidebarProps) => {
  return (
    <Render on="desktop">
      <DesktopSideMenu
        selectedApp={selectedApp}
        openAppsModal={openAppsModal}
      />
    </Render>
  );
};

export default Sidebar;
