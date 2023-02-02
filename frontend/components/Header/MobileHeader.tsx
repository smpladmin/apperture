import {
  Box,
  Flex,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
} from '@chakra-ui/react';
import 'remixicon/fonts/remixicon.css';
import MobileSidemenu from './MobileSideMenu';
import Search from './Search';
import { Provider } from '@lib/domain/provider';
import { AppWithIntegrations } from '@lib/domain/app';
import { getProviderLogo } from '@lib/utils/common';
import Image from 'next/image';

type MobileHeaderProps = {
  openAppsModal: Function;
  dataSourceType: Provider;
  openSwitchDataSourceModal: () => void;
  selectedApp: AppWithIntegrations;
};

const MobileHeader = ({
  openAppsModal,
  dataSourceType,
  openSwitchDataSourceModal,
  selectedApp,
}: MobileHeaderProps) => {
  const {
    isOpen: isDrawerOpen,
    onOpen: openDrawer,
    onClose: closeDrawer,
  } = useDisclosure();

  return (
    <Flex
      direction={'column'}
      h={'auto'}
      w={'full'}
      gap={'4'}
      bg={'white.DEFAULT'}
      py={'4'}
      px={'4'}
      shadow={'xs'}
    >
      <Flex
        w={'full'}
        gap={'3'}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        <IconButton
          aria-label="menu"
          icon={<i className="ri-menu-line"></i>}
          minWidth={'auto'}
          bg={'transparent'}
          onClick={openDrawer}
        />

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

        <Search dataSourceType={dataSourceType} />
        <Box
          flexShrink={0}
          onClick={openSwitchDataSourceModal}
          cursor={'pointer'}
        >
          <Box h={'5'} w={'5'}>
            <Image src={getProviderLogo(dataSourceType)} alt="data-source" />
          </Box>
        </Box>
      </Flex>
      {/* <Flex w={'full'} justifyContent={'space-between'} alignItems={'center'}>
        <Flex alignItems={'center'} gap={2} cursor={'not-allowed'}>
          <i className="ri-calendar-fill"></i>
          <Text fontSize={'xs-12'} lineHeight={'xs-12'} fontWeight={'500'}>
            {''}
          </Text>
        </Flex>
        <Box h={3} cursor={'not-allowed'}>
          <Image src={filterMobile} alt="filter-icon" />
        </Box>
      </Flex> */}
    </Flex>
  );
};

export default MobileHeader;
