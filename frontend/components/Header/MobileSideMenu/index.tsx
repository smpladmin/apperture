import 'remixicon/fonts/remixicon.css';
import appertureLogo from '@assets/images/apperture_small-icon.svg';
import {
  Flex,
  Box,
  Text,
  Avatar,
  Divider,
  IconButton,
  useDisclosure,
} from '@chakra-ui/react';
import { AppWithIntegrations } from '@lib/domain/app';
import LogoutModal from '@components/Logout';
import Image from 'next/image';
import MobileSidemenuOption from './MobileSideMenuOption';

type MobileSidemenuProps = {
  closeDrawer: Function;
  openAppsModal: Function;
  selectedApp: AppWithIntegrations;
};

const MobileSidemenu = ({
  closeDrawer,
  openAppsModal,
  selectedApp,
}: MobileSidemenuProps) => {
  const {
    isOpen: isLogoutModalOpen,
    onOpen: openLogoutModal,
    onClose: closeLogoutModal,
  } = useDisclosure();

  return (
    <Flex
      direction={'column'}
      backgroundColor={'white'}
      paddingTop={'6'}
      paddingBottom={'3'}
      h={'full'}
    >
      <Box px={'4'}>
        <Image src={appertureLogo} alt="appertureLogo" height={'20'} />
      </Box>

      <Divider
        orientation="horizontal"
        marginY={'6'}
        borderColor={'white.200'}
        opacity={1}
      />

      <Flex flexDirection={'column'} gap={'4'}>
        <Text
          fontSize={'xs-12'}
          lineHeight={'xs-12'}
          textColor={'grey.100'}
          opacity={1}
          fontWeight={500}
          paddingX={4}
        >
          APP
        </Text>
        <Flex
          paddingX={4}
          onClick={() => {
            closeDrawer();
            openAppsModal('apps');
          }}
          justifyContent={'space-between'}
          alignItems={'center'}
          width={'full'}
        >
          <Flex gap={'2'} alignItems={'center'}>
            <Avatar
              name={selectedApp.name}
              fontWeight={'bold'}
              size="sm"
              textColor={'white'}
              h={10}
              w={10}
              fontSize={'xs'}
              lineHeight={'xs-14'}
              cursor={'pointer'}
            />
            <Text fontSize={'base'} fontWeight={'semibold'} lineHeight={'base'}>
              {selectedApp.name}
            </Text>
          </Flex>
          <IconButton
            aria-label="chevron-right"
            icon={<i className="ri-arrow-right-s-line" />}
            bg={'transparent'}
            minWidth={'auto'}
            size={'lg'}
            _active={{
              backgroundColor: 'transparent',
            }}
          />
        </Flex>
      </Flex>

      <Divider
        orientation={'horizontal'}
        my={'6'}
        borderColor={'white.200'}
        opacity={1}
      />

      <Text
        fontSize={'xs-12'}
        lineHeight={'xs-12'}
        textColor={'grey.100'}
        opacity={1}
        paddingX={4}
        paddingBottom={4}
        fontWeight={500}
      >
        EXPLORE
      </Text>

      <Flex
        direction={'column'}
        justifyContent={'space-between'}
        h={'full'}
        w={'full'}
      >
        <Flex direction={'column'} gap={'2'}>
          <MobileSidemenuOption
            menuOption={{
              label: 'Map',
              icon: <i className="ri-route-fill" />,
            }}
          />
          <Flex justifyContent={'space-between'} pr={'4'}>
            <MobileSidemenuOption
              menuOption={{
                label: 'Insights',
                icon: <i className="ri-lightbulb-line" />,
              }}
            />
            <Box
              my={'4'}
              borderRadius={'sm'}
              backgroundColor={'green'}
              fontSize={'xs-10'}
              lineHeight={'xs-10'}
              fontWeight={'medium'}
              padding={1}
              textColor={'white'}
            >
              Coming soon
            </Box>
          </Flex>
          <Flex justifyContent={'space-between'} pr={'4'}>
            <MobileSidemenuOption
              menuOption={{
                label: 'Saved',
                icon: <i className="ri-bookmark-line" />,
              }}
            />
            <Box
              my={'4'}
              borderRadius={'sm'}
              backgroundColor={'green'}
              fontSize={'xs-10'}
              lineHeight={'xs-10'}
              fontWeight={'medium'}
              padding={1}
              textColor={'white'}
            >
              Coming soon
            </Box>
          </Flex>
          <Divider
            orientation={'horizontal'}
            mt={'4'}
            borderColor={'white.200'}
            opacity={1}
          />
        </Flex>
        <Flex direction={'column'} gap={'2'}>
          <MobileSidemenuOption
            menuOption={{
              label: 'Settings',
              icon: <i className="ri-settings-3-line" />,
            }}
          />
          <MobileSidemenuOption
            menuOption={{
              label: 'Logout',
              icon: <i className="ri-logout-box-r-line" />,
            }}
            onMenuClick={openLogoutModal}
          />
        </Flex>
      </Flex>
      <LogoutModal isOpen={isLogoutModalOpen} onClose={closeLogoutModal} />
    </Flex>
  );
};

export default MobileSidemenu;
