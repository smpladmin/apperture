import { Box, Divider, Flex, IconButton, Text } from '@chakra-ui/react';
import Image from 'next/image';
import React from 'react';
import 'remixicon/fonts/remixicon.css';
import slackImage from '@assets/images/slack.svg';
import { useRouter } from 'next/router';

const SettingsOptions = () => {
  const router = useRouter();

  return (
    <Box py={'3'}>
      <Box pt={'4'} pl={'4'} mb={'4'}>
        <IconButton
          aria-label="close"
          variant={'secondary'}
          icon={<i className="ri-close-fill" />}
          rounded={'full'}
          bg={'white.DEFAULT'}
          border={'1px'}
          size={'sm'}
          borderColor={'white.200'}
          onClick={() => router.push('/analytics/explore')}
        />
      </Box>

      <Text
        fontSize={'sh-20'}
        fontWeight={'semibold'}
        lineHeight={'sh-20'}
        ml={'4'}
      >
        Settings
      </Text>
      <Divider
        orientation="horizontal"
        borderColor={'white.200'}
        opacity={1}
        mt={'4'}
      />
      <Flex
        py={'3'}
        px={'4'}
        justifyContent={'space-between'}
        cursor={'pointer'}
        onClick={() => router.push('/analytics/settings/integrations')}
      >
        <Flex py={'2'} direction={'column'} gap={'2'}>
          <Text fontSize={'xs-14'} lineHeight={'xs-14'} fontWeight={'semibold'}>
            Integrations
          </Text>
          <Box
            fontSize={'xs-12'}
            lineHeight={'xs-12'}
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
          />
        </Flex>
      </Flex>
      <Divider orientation="horizontal" borderColor={'white.200'} opacity={1} />
    </Box>
  );
};

export default SettingsOptions;
