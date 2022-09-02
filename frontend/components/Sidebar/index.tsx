import { Box } from '@chakra-ui/react';
import { AppertureContext } from '@lib/contexts/appertureContext';
import { useContext } from 'react';
import Sidemenu from './Sidemenu';

const Sidebar = () => {
  const context = useContext(AppertureContext);
  return (
    <Box hidden={context.device.isMobile}>
      <Sidemenu />
    </Box>
  );
};

export default Sidebar;
