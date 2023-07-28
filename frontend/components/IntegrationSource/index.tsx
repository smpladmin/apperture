//source
import { Flex, Radio, Text } from '@chakra-ui/react';
import Image, { StaticImageData } from 'next/image';
import React from 'react';

type IntegrationSourceProps = {
  sourceName: string;
  value: string;
  imgSrc: StaticImageData;
  selected: boolean;
};

const IntegrationSource = ({
  sourceName,
  value,
  imgSrc,
  selected,
}: IntegrationSourceProps) => {
  return (
    <Flex
      width={{ base: 'auto', md: '35' }}
      height={{ base: 'auto', md: '25' }}
      px={'3'}
      py={'3'}
      border={'1px'}
      rounded={'xl'}
      borderColor={selected ? 'black.100' : 'white.200'}
      bg={selected ? 'white.100' : 'none'}
      justifyContent={'space-between'}
    >
      <Flex
        w={'full'}
        as={'label'}
        cursor={'pointer'}
        alignItems={'center'}
        justifyContent={'center'}
        gap={'3'}
        data-testid={'integration-provider'}
        direction={'column'}
      >
        <Flex
          border={'1px'}
          width={'7'}
          height={'7'}
          rounded={'full'}
          borderColor={'white'}
          alignItems={'center'}
          justifyContent={'center'}
        >
          <Image src={imgSrc} alt="gaLogo" objectFit="cover" />
        </Flex>
        <Flex direction={'column'}>
          <Text fontSize={'xs-12'} fontWeight={'500'} lineHeight={'base'}>
            {sourceName}
          </Text>
        </Flex>
        <Radio ml={'auto'} value={value} sx={{ display: 'none' }} />
      </Flex>
    </Flex>
  );
};

export default IntegrationSource;
