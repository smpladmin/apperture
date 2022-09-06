import 'remixicon/fonts/remixicon.css';
import filterIcon from '@assets/icons/filter-icon.svg';
import mixPanel from '@assets/images/mixPanel-icon.png';
import {
  Box,
  Flex,
  IconButton,
  Input,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
  Image,
} from '@chakra-ui/react';
import MobileSidemenu from '../Sidebar/MobileSidemenu';
import { useContext } from 'react';
import { AppertureContext } from '@lib/contexts/appertureContext';
import { App } from '@lib/domain/app';

type HeaderProps = {
  selectedApp: App;
  openAppsModal: Function;
};

const Header = ({ selectedApp, openAppsModal }: HeaderProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const context = useContext(AppertureContext);

  return (
    <Flex
      h={18}
      gap={{ base: 6, md: '0' }}
      w={'100%'}
      alignItems={'center'}
      justifyContent={'space-between'}
      bg={'white.DEFAULT'}
      py={3}
      px={7}
      shadow={'xs'}
    >
      <IconButton
        hidden={!context.device.isMobile}
        aria-label="menu"
        icon={<i className="ri-menu-line"></i>}
        minWidth={'auto'}
        bg={'transparent'}
        onClick={onOpen}
      />
      {context.device.isMobile && (
        <Drawer placement="left" isOpen={isOpen} onClose={onClose}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerBody p={0}>
              <MobileSidemenu
                closeDrawer={onClose}
                openAppsModal={openAppsModal}
                selectedApp={selectedApp}
              />
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      )}

      <Input
        size={'lg'}
        w={{ base: 'full', md: 100 }}
        h={{ base: 10, md: 12 }}
        bg={'white.100'}
        rounded={'6.25rem'}
        fontSize={'base'}
        lineHeight={'base'}
        textColor={'black'}
        borderColor={'white.200'}
        placeholder="Search for events"
        py={4}
        px={3.5}
        _placeholder={{
          fontSize: '1rem',
          lineHeight: '1.375rem',
          fontWeight: 400,
          color: 'grey.100',
        }}
      />
      <Flex alignItems={'center'} justifyContent={'space-between'} gap={6}>
        <Box hidden={context.device.isMobile}>
          <i className="ri-calendar-fill"></i>
        </Box>
        <Box hidden={context.device.isMobile}>
          <Image src={filterIcon.src} alt="filter-icon" />
        </Box>
        <Box flexShrink={0}>
          <Image
            h={{ base: 5, md: 8 }}
            w={{ base: 5, md: 8 }}
            src={mixPanel.src}
            alt="data-source-mix-panel"
          />
        </Box>
      </Flex>
    </Flex>
  );
};

export default Header;
