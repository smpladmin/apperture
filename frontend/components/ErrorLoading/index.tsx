import { Box, Flex, Text, Image } from '@chakra-ui/react';
import React from 'react';
import Error from '@assets/images/ErrorStateIcon.svg';

const Loading = () => {
  return (
    <Box height={'full'} paddingX={{ base: 4, md: 0 }}>
      <Flex
        width={'full'}
        height={'full'}
        direction={'column'}
        justifyContent={'center'}
        alignItems={'center'}
        textAlign={'center'}
        position={'relative'}
      >
        <Image
          src={Error.src}
          pb={10}
          alt="Integration completed"
          w={{ base: 60, md: 75 }}
          h={'auto'}
        />
        <Box width={{ base: 'full', md: 88 }} paddingX={{ base: 4, md: 0 }}>
          <Text
            fontWeight={'bold'}
            fontSize={'sh-28'}
            lineHeight={'sh-28'}
            marginBottom={2}
          >
            Uh oh! <br />
            Something went wrong
          </Text>
          <Text
            fontSize={{ base: 'xs-14', md: 'xs-14' }}
            lineHeight={{ base: 'xs-14', md: 'xs-14' }}
            color={'grey.200'}
          >
            Seems like there was an issue loading your data. Our team will get
            in touch with you shortly.
          </Text>
        </Box>
      </Flex>
    </Box>
  );
};

export default Loading;
