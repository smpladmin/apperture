import { Box } from '@chakra-ui/react';
import { AppertureContext } from '@lib/contexts/appertureContext';
import { App } from '@lib/domain/app';
import { useContext } from 'react';
import Sidemenu from './Sidemenu';

type SidebarProps = {
  apps: App[];
};

const Sidebar = ({ apps }: SidebarProps) => {
  console.log('sidebar', apps);
  const context = useContext(AppertureContext);
  return (
    <Box hidden={context.device.isMobile}>
      <Sidemenu apps={apps} />
    </Box>
  );
};

export default Sidebar;
