import Sheet from 'react-modal-sheet';
import { useState } from 'react';
import {
  Box,
  Button,
  Divider,
  Flex,
  Input,
  RangeSlider,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  RangeSliderTrack,
  Text,
} from '@chakra-ui/react';

const Parallelline = () => {
  return (
    <svg
      width="6"
      height="8"
      viewBox="0 0 6 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.3999 0.159607L4.4399 0.159607L4.4399 7.83961L5.3999 7.83961L5.3999 0.159607ZM1.5599 0.159607L0.599902 0.159607L0.599902 7.83961L1.5599 7.83961L1.5599 0.159607Z"
        fill="white"
      />
    </svg>
  );
};

const Alerts = () => {
  const [isOpen, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Open sheet</button>
      <Sheet
        isOpen={isOpen}
        onClose={() => setOpen(false)}
        disableDrag={true}
        detent="content-height"
      >
        <Sheet.Container>
          <Sheet.Header>
            <Flex
              justifyContent={'space-between'}
              pt={'5'}
              px={'4'}
              pb={'4'}
              alignItems={'center'}
            >
              <Text
                fontSize={'sh-20'}
                lineHeight={'sh-20'}
                fontWeight={'semibold'}
              >
                Alert me
              </Text>
              <span onClick={() => setOpen(false)}>🅧</span>
            </Flex>
            <Divider
              orientation="horizontal"
              borderColor={'white.200'}
              opacity={1}
            />
          </Sheet.Header>
          <Sheet.Content>
            <Box px={'4'} py={'4'}>
              {/* user/hits */}
              <Flex direction={'column'} gap={'2'} mb={'4'}>
                <Text
                  fontSize={'xs-14'}
                  lineHeight={'xs-14'}
                  fontWeight={'semibold'}
                >
                  When daily
                </Text>
                <Flex gap={'2'}>
                  <Flex
                    paddingX={'3'}
                    paddingY={'2'}
                    cursor={'pointer'}
                    bg={'black.100'}
                    borderRadius={'25'}
                    alignItems={'center'}
                  >
                    <Text
                      fontSize={'xs-12'}
                      fontWeight={'medium'}
                      color="white"
                      lineHeight={'xs-12'}
                    >
                      #Users
                    </Text>
                  </Flex>
                  <Flex
                    paddingX={'3'}
                    paddingY={'2'}
                    cursor={'pointer'}
                    bg={'black.100'}
                    borderRadius={'25'}
                    alignItems={'center'}
                  >
                    <Text
                      fontSize={'xs-12'}
                      fontWeight={'medium'}
                      color="white"
                      lineHeight={'xs-12'}
                    >
                      #Hits
                    </Text>
                  </Flex>
                </Flex>
              </Flex>
              <Divider
                orientation="horizontal"
                borderColor={'white.200'}
                opacity={1}
                mb={'4'}
              />
              {/* movement */}
              <Flex direction={'column'} gap={'2'} mb={'4'}>
                <Text
                  fontSize={'xs-14'}
                  lineHeight={'xs-14'}
                  fontWeight={'semibold'}
                >
                  moves
                </Text>
                <Flex gap={'2'}>
                  <Flex
                    paddingX={'3'}
                    paddingY={'2'}
                    cursor={'pointer'}
                    bg={'black.100'}
                    borderRadius={'25'}
                    alignItems={'center'}
                  >
                    <Text
                      fontSize={'xs-12'}
                      fontWeight={'medium'}
                      color="white"
                      lineHeight={'xs-12'}
                    >
                      out of Range
                    </Text>
                  </Flex>
                  <Flex
                    paddingX={'3'}
                    paddingY={'2'}
                    cursor={'pointer'}
                    bg={'black.100'}
                    borderRadius={'25'}
                    alignItems={'center'}
                  >
                    <Text
                      fontSize={'xs-12'}
                      fontWeight={'medium'}
                      color="white"
                      lineHeight={'xs-12'}
                    >
                      more than %
                    </Text>
                  </Flex>
                </Flex>
              </Flex>
              {/* slider */}
              <Box>
                <Flex justifyContent={'space-between'}>
                  <Flex direction={'column'} gap={'1'}>
                    <Text
                      fontSize={'xs-10'}
                      lineHeight={'xs-10'}
                      color={'grey.100'}
                      fontWeight={'normal'}
                    >
                      Lower Bound
                    </Text>
                    <Text
                      fontSize={'xs-14'}
                      lineHeight={'xs-14'}
                      fontWeight={'semibold'}
                    >
                      4.1M
                    </Text>
                  </Flex>
                  <Flex direction={'column'}>
                    <Text
                      fontSize={'xs-10'}
                      lineHeight={'xs-10'}
                      color={'grey.100'}
                      fontWeight={'normal'}
                    >
                      Upper Bound
                    </Text>
                    <Text
                      fontSize={'xs-14'}
                      lineHeight={'xs-14'}
                      fontWeight={'semibold'}
                    >
                      5.4M
                    </Text>
                  </Flex>
                </Flex>
                <Flex mt={'2'} py={'4'}>
                  <RangeSlider
                    defaultValue={[5000, 15000]}
                    min={999}
                    max={20000}
                  >
                    <RangeSliderTrack bg="white.200">
                      <RangeSliderFilledTrack bg="black.100" />
                    </RangeSliderTrack>
                    <RangeSliderThumb boxSize={5} index={0} bg={'black.100'}>
                      <Parallelline />
                    </RangeSliderThumb>
                    <RangeSliderThumb boxSize={5} index={1} bg={'black.100'}>
                      <Parallelline />
                    </RangeSliderThumb>
                  </RangeSlider>
                </Flex>
              </Box>
              <Flex direction={'column'} gap={'1'}>
                <Text
                  fontSize={'xs-10'}
                  lineHeight={'xs-10'}
                  color={'grey.100'}
                  fontWeight={'normal'}
                >
                  % Change
                </Text>
                <Input type={'number'} bg={'white.100'} />
              </Flex>
              <Button
                variant={'primary'}
                rounded={'lg'}
                bg={'black.100'}
                p={6}
                fontSize={{ base: 'xs-14', md: 'base' }}
                lineHeight={{ base: 'xs-14', md: 'base' }}
                fontWeight={'semibold'}
                textColor={'white.100'}
                w={'full'}
                mt={'4'}
              >
                Done
              </Button>
            </Box>
          </Sheet.Content>
        </Sheet.Container>

        <Sheet.Backdrop />
      </Sheet>
    </>
  );
};

export default Alerts;
