import { Avatar, Box, Flex, Radio, Text } from '@chakra-ui/react';
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
      w={'125'}
      px={'3'}
      py={'4'}
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
      >
        <Flex
          border={'1px'}
          width={'13'}
          height={'13'}
          rounded={'full'}
          borderColor={'white.200'}
          alignItems={'center'}
          justifyContent={'center'}
        >
          <Image src={imgSrc} alt="gaLogo" />
        </Flex>
        <Flex direction={'column'}>
          <Text fontSize={'base'} fontWeight={'500'} lineHeight={'base'}>
            {sourceName}
          </Text>
        </Flex>
        <Radio ml={'auto'} value={value} colorScheme={'radioBlack'} />
      </Flex>
    </Flex>
  );
};

export default IntegrationSource;
