import { Box } from '@chakra-ui/react';
import Sidemenu from './Sidemenu';

const Sidebar = ({ isMobile }: { isMobile: boolean }) => {
  return (
    <Box hidden={isMobile}>
      <Sidemenu />
    </Box>
  );
};

export default Sidebar;
