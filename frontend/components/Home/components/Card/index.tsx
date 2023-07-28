import { Box, Text, Flex, Link, useDisclosure } from '@chakra-ui/react';
import React, { useState } from 'react';
import Plus from '@assets/images/PlusHover.svg';
import { useRouter } from 'next/router';
import ProviderModal from '../ProviderModal';
import Image from 'next/image';

interface HomecardProps {
  icon: string;
  text: string;
  url: string;
  disable?: boolean;
  appId: string;
}

const Homecard: React.FC<HomecardProps> = ({
  icon,
  text,
  url,
  disable = false,
  appId,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [onHover, setOnHover] = useState(false);
  const router = useRouter();
  const handleHover = () => {
    setOnHover(true);
  };

  const handleMouseLeave = () => {
    setOnHover(false);
  };

  return (
    <>
      <Flex
        cursor={'pointer'}
        textAlign="center"
        flexDir={'column'}
        p={5}
        bg="white"
        borderRadius={12}
        borderWidth="1px"
        borderStyle="solid"
        borderColor="white.200"
        onMouseEnter={handleHover}
        onMouseLeave={handleMouseLeave}
        transition="opacity 0.3s ease"
        onClick={() => {
          disable ? onOpen() : router.push(`${url}`);
        }}
        opacity={disable ? 0.4 : 1}
      >
        <Box position="relative">
          <Flex
            justifyContent="center"
            alignItems="center"
            position="absolute"
            width="full"
            height="full"
            opacity={onHover ? 1 : 0}
            transition="opacity 0.3s ease"
          >
            <Image src={Plus} objectFit="contain" />
          </Flex>
          <Image src={icon} alt={`Create New ${text}`} priority />
        </Box>
        <Text mt={4} fontSize="xs-14" lineHeight="130%" fontWeight={500}>
          {text}
        </Text>
      </Flex>
      <ProviderModal isOpen={isOpen} onClose={onClose} appId={appId} />
    </>
  );
};

export default Homecard;
