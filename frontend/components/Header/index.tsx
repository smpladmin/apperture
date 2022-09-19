import 'remixicon/fonts/remixicon.css';
import filterIcon from '@assets/icons/filter-icon.svg';
import filterMobile from '@assets/images/filterIconMobile.svg';
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
  Text,
} from '@chakra-ui/react';
import MobileSidemenu from '../Sidebar/MobileSidemenu';
import { useContext } from 'react';
import { AppertureContext } from '@lib/contexts/appertureContext';
import { AppWithIntegrations } from '@lib/domain/app';
import FiltersModal from '@components/FiltersModal';

type HeaderProps = {
  selectedApp: AppWithIntegrations;
  openAppsModal: Function;
};

const Header = ({ selectedApp, openAppsModal }: HeaderProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isfiltersModalOpen,
    onOpen: openFiltersModal,
    onClose: closeFiltersModal,
  } = useDisclosure();
  const context = useContext(AppertureContext);

  return (
    <Flex
      direction={{ base: 'column', md: 'row' }}
      h={{ base: 'auto', md: '18' }}
      w={'full'}
      gap={'4'}
      bg={'white.DEFAULT'}
      py={{ base: '4', md: '3' }}
      px={{ base: '4', md: '7' }}
      shadow={'xs'}
    >
      <Flex
        w={'full'}
        gap={{ base: 3, md: '0' }}
        alignItems={'center'}
        justifyContent={'space-between'}
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
            <DrawerOverlay backdropFilter="auto" backdropBlur="20px" />
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
          textAlign={{ base: 'center', md: 'left' }}
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
          <Box
            cursor={'pointer'}
            hidden={context.device.isMobile}
            onClick={openFiltersModal}
          >
            <Image src={filterIcon.src} alt="filter-icon" />
          </Box>
          <FiltersModal
            isOpen={isfiltersModalOpen}
            onClose={closeFiltersModal}
          />
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
      <Flex
        w={'full'}
        hidden={!context.device.isMobile}
        justifyContent={'space-between'}
        alignItems={'center'}
      >
        <Flex alignItems={'center'} gap={2}>
          <i className="ri-calendar-fill"></i>
          <Text fontSize={'xs-12'} lineHeight={'xs-12'} fontWeight={'500'}>
            1 Apr - 30 Apr
          </Text>
        </Flex>
        <Box h={3} onClick={openFiltersModal}>
          <Image src={filterMobile.src} alt="filter-icon" />
        </Box>
      </Flex>
    </Flex>
  );
};

export default Header;
