import { Box, Divider, Flex, IconButton, Text } from '@chakra-ui/react';
import Image from 'next/image';
import React from 'react';
import 'remixicon/fonts/remixicon.css';
import slackImage from '@assets/images/slack.svg';
import { useRouter } from 'next/router';
import Render from '@components/Render';

const SettingsOptions = () => {
  const router = useRouter();
  const { previousDsId } = router.query;

  return (
    <Flex
      justifyContent={{ md: 'center' }}
      alignItems={{ md: 'center' }}
      h={'full'}
    >
      <Box
        w={{ base: 'full', md: '150' }}
        p={{ base: '0', md: '8 ' }}
        borderWidth={{ md: '1px' }}
        borderColor={{ md: 'white.200' }}
        borderRadius={{ md: '12px' }}
      >
        <Flex p={{ base: '4', md: '0' }} mb={{ base: '0', md: '6' }} w={'full'}>
          <IconButton
            aria-label="close"
            variant={'secondary'}
            icon={<i className="ri-close-fill" />}
            rounded={'full'}
            bg={'white.DEFAULT'}
            border={'1px'}
            size={'sm'}
            borderColor={'white.200'}
            onClick={() => router.push(`/analytics/explore/${previousDsId}`)}
          />
        </Flex>

        <Text
          fontSize={{ base: 'sh-20', md: 'sh-44' }}
          fontWeight={'semibold'}
          lineHeight={{ base: 'sh-20', md: 'sh-44' }}
          pl={{ base: '4', md: '0' }}
          mb={{ md: '1' }}
        >
          Settings
        </Text>
        <Render on="mobile">
          <Divider
            orientation="horizontal"
            borderColor={'white.200'}
            opacity={1}
            mt={'4'}
          />
        </Render>
        <Flex
          py={'3'}
          px={'4'}
          justifyContent={'space-between'}
          cursor={'pointer'}
          onClick={() =>
            router.push(
              `/analytics/settings/integrations?previousDsId=${previousDsId}`
            )
          }
        >
          <Flex mt={{ md: '8' }} py={'2'} direction={'column'} gap={'2'}>
            <Text
              fontSize={{ base: 'xs-14', md: 'sh-20' }}
              lineHeight={{ base: 'xs-14', md: 'sh-20' }}
              fontWeight={'semibold'}
            >
              Integrations
            </Text>
            <Box
              fontSize={{ base: 'xs-12', md: 'xs-14' }}
              lineHeight={{ base: 'xs-12', md: 'xs-14' }}
              fontWeight={'normal'}
              color={'grey.200'}
            >
              Connect it to the tools you use everyday;
              <Text fontWeight={'semibold'} color={'inherit'}>
                Gmail, Slack etc.
              </Text>
            </Box>
            <Flex alignItems={'flex-start'}>
              <Image src={slackImage} alt={'slackIntegration'} />
            </Flex>
          </Flex>
          <Flex alignItems={'center'}>
            <IconButton
              aria-label="chevron-right"
              icon={<i className="ri-arrow-right-s-line"></i>}
              bg={'transparent'}
              fontWeight={'600'}
              size={'lg'}
              _hover={{
                bg: '',
              }}
            />
          </Flex>
        </Flex>
        <Divider
          display={{ md: 'none' }}
          orientation="horizontal"
          borderColor={'white.200'}
          opacity={1}
        />
      </Box>
    </Flex>
  );
};

export default SettingsOptions;
