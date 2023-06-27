import { Box, Image, Text, Flex, Link } from '@chakra-ui/react';
import React, { useState } from 'react';
import linkicon from '@assets/images/PlusHover.svg';

interface HomecardProps {
  icon: string;
  text: string;
  url: string;
}

const Homecard: React.FC<HomecardProps> = ({ icon, text, url }) => {
  const [onHover, setOnHover] = useState(false);

  const handleHover = () => {
    setOnHover(true);
  };

  const handleMouseLeave = () => {
    setOnHover(false);
  };

  return (
    <Link
      textAlign="center"
      p={5}
      bg="white"
      borderRadius={12}
      borderWidth="1px"
      borderStyle="solid"
      borderColor="white.200"
      onMouseEnter={handleHover}
      onMouseLeave={handleMouseLeave}
      transition="opacity 0.3s ease"
      href={url}
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
          <Image src={linkicon.src} objectFit="contain" />
        </Flex>
        <Image src={icon} alt={`Create New ${text}`} />
      </Box>

      <Text mt={4} fontSize="xs-14" lineHeight="130%" fontWeight={500}>
        {text}
      </Text>
    </Link>
  );
};

export default Homecard;
