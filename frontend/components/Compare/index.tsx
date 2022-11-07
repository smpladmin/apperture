import { Input, Box, Flex, Image, Button, Text } from '@chakra-ui/react';
import comparision from '@assets/images/InterchangeIcon.svg';
import backArrow from '@assets/images/ArrowButton.svg';
import React from 'react';

function UI() {
  return (
    <Flex direction="column" gap={'80'}>
      <Box py={3} px={8}>
        <Flex
          dir={'row'}
          alignItems={'center'}
          justifyContent={'flex-start'}
          gap={3}
        >
          <Flex
            flexDir={'row'}
            width={150}
            alignItems={'center'}
            borderRadius={'100px'}
            overflow={'hidden'}
            borderColor={'grey.DEFAULT'}
            borderWidth={'1px'}
          >
            <Flex w={'50%'}>
              <Box bg="black">
                <Button
                  p={0}
                  w={'full'}
                  h={'full'}
                  borderRadius={0}
                  bg={'white.100'}
                >
                  <Image src={backArrow.src} alt="Delete-query"></Image>
                </Button>
              </Box>
              <Input
                pl={0}
                flexGrow={1}
                bg={'white.100'}
                borderWidth={'0px'}
                borderRightWidth={'0.5px'}
                borderColor={'grey.DEFAULT'}
                borderRadius={0}
                height={'50px'}
                sx={{ zIndex: '1' }}
                position={'relative'}
                fontWeight={'600'}
                fontSize={'sh-20'}
                lineHeight={'sh-20'}
              ></Input>
            </Flex>
            <Button
              p={0}
              h={'full'}
              borderRadius={0}
              bg={'white.100'}
              marginLeft={'-20px'}
              marginRight={'-20px'}
              sx={{ zIndex: '2' }}
            >
              <Image
                width={'30px'}
                height={'30px'}
                src={comparision.src}
                alt="Comparision-Icon"
                position={'relative'}
              />
            </Button>
            <Input
              w={'50%'}
              bg={'white.100'}
              height={'50px'}
              borderWidth={'0px'}
              borderLeftWidth={'0.5px'}
              borderColor={'grey.DEFAULT'}
              borderRadius={0}
              position={'relative'}
              fontWeight={'600'}
              fontSize={'sh-20'}
              lineHeight={'sh-20'}
              paddingLeft={'6'}
              placeholder={'Select sink event'}
              sx={{ zIndex: '1' }}
            ></Input>
          </Flex>
          <Button
            bg={'black'}
            color={'white'}
            borderRadius={'100px'}
            paddingX={'12'}
            paddingY={'4'}
            height={'12'}
          >
            View Conversion
          </Button>
        </Flex>
      </Box>
      <Box py={3} px={8}>
        <Flex>
          <Flex
            direction={'column'}
            gap={'3'}
            flexGrow={'1'}
            position={'relative'}
          >
            <Box
              position={'absolute'}
              width={'1px'}
              top={'8'}
              left={'19.5px'}
              height={'7'}
              bg={'black'}
            ></Box>
            <Flex borderRadius={'100px'} overflow={'hidden'}>
              <Flex
                justifyContent={'center'}
                alignItems={'center'}
                bg={'white.100'}
                paddingLeft={'3'}
              >
                <Flex
                  justifyContent={'center'}
                  alignItems={'center'}
                  height={'4'}
                  width={'4'}
                  borderRadius={'100%'}
                  bg={'black'}
                >
                  <Text fontSize={'xs-10'} lineHeight={'xs-10'} color={'white'}>
                    1
                  </Text>
                </Flex>
              </Flex>
              <Input
                bg={'white.100'}
                height={'40px'}
                borderWidth={'0px'}
                borderRadius={0}
                position={'relative'}
                fontWeight={'400'}
                fontSize={'base'}
                lineHeight={'base'}
                placeholder={'App Launched'}
                sx={{ zIndex: '1' }}
              ></Input>
            </Flex>
            <Flex borderRadius={'100px'} overflow={'hidden'}>
              <Flex
                justifyContent={'center'}
                alignItems={'center'}
                bg={'white.100'}
                paddingLeft={'3'}
              >
                <Flex
                  justifyContent={'center'}
                  alignItems={'center'}
                  height={'4'}
                  width={'4'}
                  padding={'1'}
                  borderRadius={'100%'}
                  bg={'black'}
                >
                  <Text fontSize={'xs-10'} lineHeight={'xs-10'} color={'white'}>
                    2
                  </Text>
                </Flex>
              </Flex>
              <Input
                bg={'white.100'}
                height={'40px'}
                borderWidth={'0px'}
                borderRadius={0}
                position={'relative'}
                fontWeight={'400'}
                fontSize={'base'}
                lineHeight={'base'}
                placeholder={'Select Sink Event'}
                sx={{ zIndex: '1' }}
              ></Input>
            </Flex>
          </Flex>
          <Box>
            <Button
              p={0}
              h={'full'}
              borderRadius={0}
              bg={'white'}
              sx={{ zIndex: '2' }}
            >
              <Image
                width={'30px'}
                height={'30px'}
                src={comparision.src}
                alt="Comparision-Icon"
                position={'relative'}
                sx={{ transform: 'rotate(90deg)' }}
              />
            </Button>
          </Box>
        </Flex>
      </Box>
    </Flex>
  );
}

export default UI;
