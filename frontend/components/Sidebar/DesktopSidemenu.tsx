import 'remixicon/fonts/remixicon.css';
import logo from '@assets/images/apperture_white-icon.svg';
import React from 'react';
import {
  Flex,
  Box,
  Image,
  Text,
  Avatar,
  IconButton,
  useDisclosure,
  Tooltip,
} from '@chakra-ui/react';
import { AppWithIntegrations } from '@lib/domain/app';
import LogoutModal from '@components/Logout';
import { useRouter } from 'next/router';

type SidemenuProps = {
  selectedApp: AppWithIntegrations;
  openAppsModal: Function;
};

const DesktopSideMenu = ({ selectedApp, openAppsModal }: SidemenuProps) => {
  const {
    isOpen: isLogoutModalOpen,
    onOpen: openLogoutModal,
    onClose: closeLogoutModal,
  } = useDisclosure();

  const router = useRouter();
  const path = router.pathname;
  const { dsId, previousDsId } = router.query;

  const handleRedirectToExplorePage = () => {
    if (path.includes('/analytics/explore')) return;

    router.push({
      pathname: '/analytics/explore/[dsId]',
      query: { dsId: dsId || previousDsId },
    });
  };

  const handleRedirectToDataPage = () => {
    if (path.includes('/analytics/data')) return;

    router.push({
      pathname: '/analytics/data/[dsId]',
      query: { dsId: dsId || previousDsId },
    });
  };

  return (
    <Flex
      height={'full'}
      width={'full'}
      maxWidth={'4rem'}
      direction={'column'}
      alignItems={'center'}
      flexShrink={'0'}
      flexGrow={'0'}
      backgroundColor={'black.100'}
      textAlign={'center'}
      textColor={'white'}
      fontSize={'base'}
      paddingTop={3}
      paddingBottom={12}
      overflowY={'auto'}
    >
      <Box>
        <Image
          src={logo.src}
          paddingBottom={'10'}
          alt="appertureLogo"
          width={'1.5rem'}
          height={'auto'}
        />
      </Box>
      <Box>
        <Text
          fontSize={'xs-10'}
          lineHeight={'xs-10'}
          textColor={'white'}
          opacity={'0.3'}
        >
          APP
        </Text>
        <Flex marginTop={4} gap={2}>
          <Flex
            marginBottom={10}
            justifyContent={'center'}
            alignItems={'center'}
            borderRadius={100}
            fontWeight={'bold'}
            fontSize={'xs-14'}
            lineHeight={'xs-14'}
            onClick={() => openAppsModal()}
          >
            <Avatar
              name={selectedApp.name}
              fontWeight={'bold'}
              size="sm"
              textColor={'white'}
              h={8}
              w={8}
              fontSize={'xs-14'}
              lineHeight={'xs-14'}
              cursor={'pointer'}
            />
          </Flex>
        </Flex>
      </Box>
      <Box>
        <Flex direction={'column'} alignItems={'center'} gap={5}>
          <Tooltip
            label={'Explore'}
            aria-label={'Explore'}
            bg={'white.DEFAULT'}
            color={'black.100'}
          >
            <IconButton
              aria-label="Explore"
              icon={<i className={'ri-route-fill'} />}
              rounded={'lg'}
              h={10}
              w={10}
              bg={'black.0'}
              fontWeight={'500'}
              color={'grey.100'}
              _hover={{
                backgroundColor: 'white.0',
                color: 'white',
              }}
              _active={{
                backgroundColor: 'transparent',
              }}
              onClick={handleRedirectToExplorePage}
            />
          </Tooltip>

          <Tooltip
            label={'Alerts'}
            aria-label={'Explore'}
            bg={'white.DEFAULT'}
            color={'black.100'}
          >
            <IconButton
              aria-label="Explore"
              icon={<i className="ri-notification-fill"></i>}
              rounded={'lg'}
              h={10}
              w={10}
              bg={'black.0'}
              fontWeight={'500'}
              color={'grey.100'}
              _hover={{
                backgroundColor: 'white.0',
                color: 'white',
              }}
              _active={{
                backgroundColor: 'transparent',
              }}
              onClick={() =>
                router.push(`/analytics/notifications/list/${dsId}`)
              }
            />
          </Tooltip>
          <Tooltip
            label={'Data'}
            aria-label={'Data'}
            bg={'white.DEFAULT'}
            color={'black.100'}
          >
            <IconButton
              aria-label="Data"
              icon={<i className={'ri-database-line'} />}
              rounded={'lg'}
              h={10}
              w={10}
              bg={'black.0'}
              fontWeight={'500'}
              color={'grey.100'}
              _hover={{
                backgroundColor: 'white.0',
                color: 'white',
              }}
              _active={{
                backgroundColor: 'transparent',
              }}
              onClick={handleRedirectToDataPage}
            />
          </Tooltip>

          <Tooltip
            label={'Metrics'}
            aria-label={'Metrics'}
            bg={'white.DEFAULT'}
            color={'black.100'}
          >
            <IconButton
              aria-label="Metrics"
              icon={<i className={'ri-funds-box-line'} />}
              rounded={'lg'}
              h={10}
              w={10}
              bg={'black.0'}
              fontWeight={'500'}
              color={'grey.100'}
              _hover={{
                backgroundColor: 'white.0',
                color: 'white',
              }}
              _active={{
                backgroundColor: 'transparent',
              }}
              onClick={() => router.push(`/analytics/metric/list/${dsId}`)}
            />
          </Tooltip>
          <Tooltip
            label={'Funnels'}
            aria-label={'Funnels'}
            bg={'white.DEFAULT'}
            color={'black.100'}
          >
            <IconButton
              aria-label="Funnels"
              icon={<i className={'ri-filter-line'} />}
              rounded={'lg'}
              h={10}
              w={10}
              bg={'black.0'}
              fontWeight={'500'}
              color={'grey.100'}
              _hover={{
                backgroundColor: 'white.0',
                color: 'white',
              }}
              _active={{
                backgroundColor: 'transparent',
              }}
              onClick={() => router.push(`/analytics/funnel/list/${dsId}`)}
            />
          </Tooltip>
          <Tooltip
            label={'Segments'}
            aria-label={'Segments'}
            bg={'white.DEFAULT'}
            color={'black.100'}
          >
            <IconButton
              aria-label="Segments"
              icon={<i className={'ri-scissors-cut-line'} />}
              rounded={'lg'}
              h={10}
              w={10}
              bg={'black.0'}
              fontWeight={'500'}
              color={'grey.100'}
              _hover={{
                backgroundColor: 'white.0',
                color: 'white',
              }}
              _active={{
                backgroundColor: 'transparent',
              }}
              onClick={() => router.push(`/analytics/segment/list/${dsId}`)}
            />
          </Tooltip>
        </Flex>
      </Box>
      <Box
        marginTop={'auto'}
        onClick={() => router.push(`/analytics/settings?previousDsId=${dsId}`)}
      >
        <Tooltip
          label={'Settings'}
          aria-label={'Settings'}
          bg={'white.DEFAULT'}
          color={'black.100'}
        >
          <IconButton
            aria-label="settings"
            icon={<i className="ri-settings-3-line"></i>}
            rounded={'lg'}
            h={10}
            w={10}
            bg={'black.0'}
            fontWeight={'500'}
            color={'grey.100'}
            _hover={{
              backgroundColor: 'white.0',
              color: 'white',
            }}
            _active={{
              backgroundColor: 'transparent',
            }}
          />
        </Tooltip>
      </Box>
      <Box marginTop={'4'} onClick={openLogoutModal}>
        <Tooltip
          label={'Logout'}
          aria-label={'Logout'}
          bg={'white.DEFAULT'}
          color={'black.100'}
        >
          <IconButton
            aria-label="close"
            icon={<i className="ri-logout-box-r-line" />}
            rounded={'lg'}
            h={10}
            w={10}
            bg={'black.0'}
            fontWeight={'500'}
            color={'grey.100'}
            _hover={{
              backgroundColor: 'white.0',
              color: 'white',
            }}
            _active={{
              backgroundColor: 'transparent',
            }}
          />
        </Tooltip>
      </Box>
      <LogoutModal isOpen={isLogoutModalOpen} onClose={closeLogoutModal} />
    </Flex>
  );
};

export default DesktopSideMenu;
