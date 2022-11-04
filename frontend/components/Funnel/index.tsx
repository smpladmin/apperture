import { Box, Button, Flex, IconButton, Input, Text } from '@chakra-ui/react';
import 'remixicon/fonts/remixicon.css';
import FunnelImage from '@assets/images/funnel.svg';
import React, { useState } from 'react';
import Image from 'next/image';
import CreateFunnel from './CreateFunnel';

const Funnel = () => {
  const [funnelName, setFunnelName] = useState('Untitled Funnel');
  const [emptyState, setEmptyState] = useState(true);

  return (
    <Flex w={'full'} height={'full'}>
      <Box
        minW={'102'}
        height={'full'}
        overflowY={'auto'}
        bg={' #181822'}
        py={'6'}
        px={'6'}
      >
        <Flex justifyContent={'space-between'} alignItems={'center'}>
          <IconButton
            aria-label="close"
            variant={'secondary'}
            icon={<i className="ri-arrow-left-line"></i>}
            rounded={'full'}
            color={'white.DEFAULT'}
            bg={'rgba(255, 255, 255, 0.05)'}
            onClick={() => {}}
          />
          <Button
            disabled={true}
            borderRadius={'50'}
            _disabled={{
              bg: 'rgba(255, 255, 255, 0.06)',
              pointerEvents: 'none',
            }}
          >
            {'Save'}
          </Button>
        </Flex>
        <Flex direction={'column'} mt={'8'} gap={'2'}>
          <Text
            fontSize={'xs-14'}
            lineHeight={'xs-14'}
            fontWeight={'normal'}
            color={'grey.DEFAULT'}
          >
            Alias
          </Text>
          <Input
            pr={'4'}
            type={'text'}
            variant="flushed"
            fontSize={'sh-32'}
            lineHeight={'sh-32'}
            fontWeight={'semibold'}
            textColor={'white.DEFAULT'}
            value={funnelName}
            onChange={(e) => setFunnelName(e.target.value)}
            borderColor={'rgba(255, 255, 255, 0.2)'}
            px={0}
          />
        </Flex>
        <Box mt={'9'}>
          <CreateFunnel />
        </Box>
      </Box>
      {emptyState ? (
        <Flex w={'full'} alignItems={'center'} justifyContent={'center'}>
          <Box>
            <Image
              src={FunnelImage}
              priority={true}
              alt={'funnel-empty-state'}
            />
            <Text
              textAlign={'center'}
              mt={'10'}
              fontSize={'sh-20'}
              lineHeight={'sh-20'}
              fontWeight={'normal'}
              color={'grey.100'}
            >
              Enter events to create a funnel
            </Text>
          </Box>
        </Flex>
      ) : null}
    </Flex>
  );
};

export default Funnel;
