import 'remixicon/fonts/remixicon.css';
import logoSmall from '@assets/images/apperture_small-icon.svg';
import Link from 'next/link';
import React from 'react';
import {
  Flex,
  Box,
  Image,
  Text,
  Avatar,
  Divider,
  IconButton,
} from '@chakra-ui/react';
import { App } from '@lib/domain/app';

type SidemenuProps = {
  closeDrawer: Function;
  openAppsModal: Function;
  selectedApp: App;
};

const MobileSidemenu = ({
  closeDrawer,
  openAppsModal,
  selectedApp,
}: SidemenuProps) => {
  return (
    <Flex
      height={'full'}
      width={'full'}
      maxWidth={'full'}
      direction={'column'}
      alignItems={'flex-start'}
      flexShrink={'0'}
      flexGrow={'0'}
      backgroundColor={'white'}
      textAlign={'center'}
      textColor={'black'}
      fontSize={'base'}
      paddingTop={{ md: 3 }}
      paddingBottom={{ md: 12 }}
    >
      <Box>
        <Image
          src={logoSmall.src}
          alt="appertureLogo"
          width={'7.125rem'}
          height={'auto'}
          paddingX={4}
          paddingTop={4}
        />
      </Box>
      <Box width={'full'}>
        <Divider
          orientation="horizontal"
          marginY={'4'}
          borderColor={'white.200'}
          opacity={1}
        />
      </Box>
      <Flex width={'full'} flexDirection={'column'} alignItems={'flex-start'}>
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
          width={'full'}
          paddingX={4}
          marginTop={4}
          gap={2}
          onClick={() => {
            closeDrawer();
            openAppsModal();
          }}
        >
          <Flex
            marginBottom={0}
            justifyContent={'center'}
            alignItems={'center'}
            borderRadius={100}
            fontWeight={'bold'}
            fontSize={'xs-14'}
            lineHeight={'xs-14'}
          >
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
          </Flex>
          <Box width={'full'}>
            <Flex
              width={'full'}
              gap={2}
              justifyContent={'space-between'}
              alignItems={'center'}
            >
              <Box textAlign={'left'}>
                <Text
                  fontSize={'base'}
                  fontWeight={'semibold'}
                  lineHeight={'base'}
                >
                  {selectedApp.name}
                </Text>
                <Text
                  fontSize={'xs-12'}
                  fontWeight={'regular'}
                  lineHeight={'xs-12'}
                  color={'grey.200'}
                >
                  {`ID ${selectedApp._id}`}
                </Text>
              </Box>
              <IconButton
                aria-label="close"
                icon={<i className="ri-arrow-right-s-line" />}
                bg={'transparent'}
                minWidth={'auto'}
                fontWeight={'inherit'}
                _hover={{
                  backgroundColor: 'transparent',
                }}
                _active={{
                  backgroundColor: 'transparent',
                }}
              />
            </Flex>
          </Box>
        </Flex>
        <Box width={'full'}>
          <Divider
            orientation={'horizontal'}
            mt={'4'}
            mb={'6'}
            borderColor={'white.200'}
            opacity={1}
          />
        </Box>
      </Flex>

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
      <Box width="full">
        <Box width={'full'}>
          <Flex
            width={'full'}
            height={'3.375rem'}
            borderRadius={'12px'}
            justifyContent={'flex-start'}
            alignItems={'center'}
            gap={'3'}
            p={'4'}
            mb={'4'}
            fontWeight={'400'}
            _hover={{
              backgroundColor: 'white.100',
              fontWeight: '500',
              cursor: 'pointer',
            }}
            _active={{
              backgroundColor: 'transparent',
            }}
          >
            <IconButton
              aria-label="map"
              icon={<i className="ri-route-fill" />}
              minWidth={'auto'}
              bg={'transparent'}
              fontWeight={'inherit'}
              _hover={{
                backgroundColor: 'transparent',
              }}
              _active={{
                backgroundColor: 'transparent',
              }}
            />
            Map
          </Flex>
          <Flex
            width={'full'}
            height={'3.375rem'}
            borderRadius={'12px'}
            justifyContent={'space-between'}
            alignItems={'center'}
            p={'4'}
            mb={'4'}
            fontWeight={'400'}
            _hover={{
              backgroundColor: 'white.100',
              fontWeight: '500',
              cursor: 'pointer',
            }}
            _active={{
              backgroundColor: 'transparent',
            }}
          >
            <Flex
              width={'full'}
              justifyContent={'flex-start'}
              gap={'3'}
              alignItems={'center'}
            >
              <IconButton
                aria-label="insights"
                icon={<i className="ri-lightbulb-line" />}
                minWidth={'auto'}
                bg={'transparent'}
                fontWeight={'inherit'}
                _hover={{
                  backgroundColor: 'transparent',
                }}
                _active={{
                  backgroundColor: 'transparent',
                }}
              />
              Insights
            </Flex>
            <Box
              flexShrink={0}
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
          <Flex
            width={'full'}
            height={'3.375rem'}
            mb={'4'}
            borderRadius={'12px'}
            justifyContent={'space-between'}
            alignItems={'center'}
            p={'4'}
            fontWeight={'400'}
            _hover={{
              backgroundColor: 'white.100',
              fontWeight: '500',
              cursor: 'pointer',
            }}
            _active={{
              backgroundColor: 'transparent',
            }}
          >
            <Flex
              width={'full'}
              height={'3.375rem'}
              borderRadius={'12px'}
              justifyContent={'flex-start'}
              minWidth={'auto'}
              gap={'3'}
              alignItems={'center'}
            >
              <IconButton
                aria-label="saved"
                icon={<i className="ri-bookmark-line" />}
                minWidth={'auto'}
                bg={'transparent'}
                fontWeight={'inherit'}
                _hover={{
                  backgroundColor: 'transparent',
                }}
                _active={{
                  backgroundColor: 'transparent',
                }}
              />
              Saved
            </Flex>
            <Box
              flexShrink={0}
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
          <Box width={'full'}>
            <Divider
              orientation={'horizontal'}
              mt={'4'}
              mb={'6'}
              borderColor={'white.200'}
              opacity={1}
            />
          </Box>
        </Box>
      </Box>
      <Link href={`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/logout`}>
        <Box marginTop={'auto'} width={'full'}>
          <Flex
            width={'full'}
            height={'3.375rem'}
            borderRadius={'12px'}
            justifyContent={'flex-start'}
            alignItems={'center'}
            mb={'4'}
            gap={'3'}
            p={'4'}
            fontWeight={'400'}
            backgroundColor={'white'}
            transition={'all 250ms ease'}
            _hover={{
              backgroundColor: 'white.100',
              fontWeight: '500',
              cursor: 'pointer',
            }}
            _active={{
              backgroundColor: 'transparent',
            }}
          >
            <IconButton
              aria-label="logout"
              icon={<i className="ri-logout-box-r-line" />}
              bg={'transparent'}
              minWidth={'auto'}
              fontWeight={'inherit'}
              _hover={{
                backgroundColor: 'transparent',
              }}
              _active={{
                backgroundColor: 'transparent',
              }}
            />
            Logout
          </Flex>
        </Box>
      </Link>
    </Flex>
  );
};

export default MobileSidemenu;
