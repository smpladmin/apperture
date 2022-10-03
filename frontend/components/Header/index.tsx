import 'remixicon/fonts/remixicon.css';
import filterIcon from '@assets/icons/filter-icon.svg';
import filterMobile from '@assets/images/filterIconMobile.svg';
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
  Image,
  Text,
} from '@chakra-ui/react';
import MobileSidemenu from '../Sidebar/MobileSidemenu';
import { useContext, useEffect, useState } from 'react';
import { AppertureContext } from '@lib/contexts/appertureContext';
import { AppWithIntegrations } from '@lib/domain/app';
import FiltersModal from '@components/FiltersModal';
import SwitchDataSource from '@components/SwitchDataSource';
import { DataSource } from '@lib/domain/datasource';
import { useRouter } from 'next/router';
import { Provider } from '@lib/domain/provider';

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

  const [dataSources, setDataSources] = useState(
    selectedApp?.integrations.flatMap(
      (integration) => integration.datasources as DataSource[]
    )
  );
  const [dataSourceType, setDataSourceType] = useState(
    dataSources.find((ds) => ds._id === dsId)?.provider
  );

  useEffect(() => {
    setDataSources(
      selectedApp?.integrations.flatMap(
        (integration) => integration.datasources as DataSource[]
      )
    );
  }, [selectedApp, dsId]);

  useEffect(() => {
    setDataSourceType(dataSources.find((ds) => ds._id === dsId)?.provider);
  }, [dataSources, dsId]);

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
          <Box hidden={context.device.isMobile} cursor={'not-allowed'}>
            <i className="ri-calendar-fill"></i>
          </Box>
          <Box cursor={'not-allowed'} hidden={context.device.isMobile}>
            <Image src={filterIcon.src} alt="filter-icon" />
          </Box>
          <FiltersModal
            isOpen={isfiltersModalOpen}
            onClose={closeFiltersModal}
          />
          <Box
            flexShrink={0}
            onClick={openSwitchDataSourceModal}
            cursor={'pointer'}
          >
            <Image
              h={{ base: 5, md: 8 }}
              w={{ base: 5, md: 8 }}
              src={
                dataSourceType === Provider.MIXPANEL ? mixPanel.src : gaLogo.src
              }
              alt="data-source-mix-panel"
            />
          </Box>
          <SwitchDataSource
            isOpen={isSwitchDataSourceModalOpen}
            onClose={closeSwitchDataSourceModal}
            dataSources={dataSources}
            selectedApp={selectedApp}
          />
        </Flex>
      </Flex>
      <Flex
        w={'full'}
        hidden={!context.device.isMobile}
        justifyContent={'space-between'}
        alignItems={'center'}
      >
        <Flex alignItems={'center'} gap={2} cursor={'not-allowed'}>
          <i className="ri-calendar-fill"></i>
          <Text fontSize={'xs-12'} lineHeight={'xs-12'} fontWeight={'500'}>
            {''}
          </Text>
        </Flex>
        <Box h={3} cursor={'not-allowed'}>
          <Image src={filterMobile.src} alt="filter-icon" />
        </Box>
      </Flex>
    </Flex>
  );
};

export default Header;
