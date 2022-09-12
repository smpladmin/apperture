import { Box, Flex, Text, Image } from '@chakra-ui/react';
import React from 'react';
import paper from '@assets/images/longDataPaper.svg';

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
          src={paper.src}
          pb={10}
          alt="Integration completed"
          w={'18.6rem'}
          h={'auto'}
        />
        <Box width={{ base: 'full', md: 88 }} paddingX={{ base: 4, md: 0 }}>
          <Text
            fontWeight={'bold'}
            fontSize={'sh-28'}
            lineHeight={'sh-28'}
            marginBottom={2}
          >
            Loading your data
          </Text>
          <Text
            fontSize={{ base: 'xs-14', md: 'base' }}
            lineHeight={{ base: 'xs-14', md: 'base' }}
            color={'grey.200'}
          >
            Apperture is fetching data from the original source. This may take
            some time
          </Text>
        </Box>
      </Flex>
    </Box>
  );
};

export default Loading;
