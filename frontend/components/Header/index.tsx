import 'remixicon/fonts/remixicon.css';
import filterIcon from '@assets/icons/filter-icon.svg';
import mixPanel from '@assets/images/mixPanel-icon.png';
import gaLogo from '@assets/images/ga-logo-small.svg';
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
} from '@chakra-ui/react';
import MobileSidemenu from '../Sidebar/MobileSidemenu';
import { useContext } from 'react';
import { AppertureContext } from '@lib/contexts/appertureContext';
import { AppWithIntegrations } from '@lib/domain/app';
import FiltersModal from '@components/FiltersModal';
import SwitchDataSource from '@components/SwitchDataSource';
import { DataSource } from '@lib/domain/datasource';
import { useRouter } from 'next/router';
import { Provider } from '@lib/domain/provider';
import Image from 'next/image';

type HeaderProps = {
  selectedApp: AppWithIntegrations;
  openAppsModal: Function;
};

const Header = ({ selectedApp, openAppsModal }: HeaderProps) => {
  const {
    isOpen: isDrawerOpen,
    onOpen: openDrawer,
    onClose: closeDrawer,
  } = useDisclosure();
  const {
    isOpen: isfiltersModalOpen,
    onOpen: openFiltersModal,
    onClose: closeFiltersModal,
  } = useDisclosure();
  const {
    isOpen: isSwitchDataSourceModalOpen,
    onOpen: openSwitchDataSourceModal,
    onClose: closeSwitchDataSourceModal,
  } = useDisclosure();

  const context = useContext(AppertureContext);
  const router = useRouter();
  const { dsId } = router.query;
  const dataSources = selectedApp?.integrations.flatMap(
    (integration) => integration.datasources as DataSource[]
  );

  const selectedDataSourceType = dataSources.find(
    (ds) => ds._id === dsId
  )?.provider;

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
        onClick={openDrawer}
      />
      {context.device.isMobile && (
        <Drawer placement="left" isOpen={isDrawerOpen} onClose={closeDrawer}>
          <DrawerOverlay backdropFilter="auto" backdropBlur="20px" />
          <DrawerContent>
            <DrawerBody p={0}>
              <MobileSidemenu
                closeDrawer={closeDrawer}
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
        <Box hidden={context.device.isMobile} onClick={openFiltersModal}>
          <Image src={filterIcon} alt="filter-icon" />
        </Box>
        <FiltersModal isOpen={isfiltersModalOpen} onClose={closeFiltersModal} />
        <Box
          flexShrink={0}
          onClick={openSwitchDataSourceModal}
          height={{ base: 5, md: 8 }}
          w={{ base: 5, md: 8 }}
        >
          <Image
            src={selectedDataSourceType === Provider.GOOGLE ? gaLogo : mixPanel}
            alt="data-source-mix-panel"
            layout={'responsive'}
          />
        </Box>
        <SwitchDataSource
          isOpen={isSwitchDataSourceModalOpen}
          onClose={closeSwitchDataSourceModal}
          dataSources={dataSources}
        />
      </Flex>
    </Flex>
  );
};

export default Header;
