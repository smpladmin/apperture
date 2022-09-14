import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  Box,
  Text,
  Flex,
  Divider,
  RadioGroup,
  Stack,
  Link,
  Radio,
  Image,
} from '@chakra-ui/react';
import mixPanel from '@assets/images/mixPanel-icon.png';
import gaIcon from '@assets/images/ga-icon.png';

function dataSource() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <Button onClick={onOpen}>Open Modal</Button>

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        isCentered
        blockScrollOnMount={false}
        size={'2xl'}
        trapFocus={false}
      >
        <ModalOverlay backdropFilter={'blur(20px)'} />
        <ModalContent
          margin={'1rem'}
          rounded={'2xl'}
          maxWidth="168"
          maxHeight={{ base: 'calc(100% - 100px)', md: 'calc(100% - 200px)' }}
          borderRadius={{ base: '16px', md: '20px' }}
        >
          <ModalHeader
            display={'flex'}
            justifyContent={'space-between'}
            alignItems={'center'}
            fontSize={{ base: 'sh-20', md: 'sh-24' }}
            lineHeight={{ base: 'sh-20', md: 'sh-24' }}
            pt={{ base: '4', md: '10' }}
            pb={{ base: '6', md: '0' }}
            px={{ base: '4', md: '9' }}
          >
            Data Source
            <ModalCloseButton
              position={'relative'}
              top={0}
              right={0}
              border={'1px'}
              borderColor={'white.200'}
              rounded={'full'}
              fontSize={'0.55rem'}
            />
          </ModalHeader>

          <Divider
            orientation="horizontal"
            mt={'7'}
            mb={'0'}
            borderColor={'white.200'}
            opacity={1}
            display={{ base: 'none', md: 'block' }}
          />
          <Box
            pt={{ base: '0', md: '9' }}
            pl={{ base: '4', md: '9' }}
            pr={{ base: '4', md: '9' }}
            pb={{ base: '6', md: '9' }}
          >
            <Text
              color={'grey.100'}
              fontWeight={'500'}
              fontSize={{ base: 'xs-14', md: 'base' }}
              lineHeight={{ base: 'xs-14', md: 'base' }}
            >
              Zomato Devilery App V3.6.1{' '}
            </Text>
          </Box>
          <ModalBody
            px={{ base: '4', md: '9' }}
            overflowY={'auto'}
            pt={'0'}
            pb={'0'}
          >
            <Box pt={0}>
              <RadioGroup>
                <Stack direction="column">
                  <Flex
                    justifyContent={'space-between'}
                    borderBottom={'1px'}
                    borderStyle={'solid'}
                    borderColor={'white.100'}
                  >
                    <Flex
                      w={'full'}
                      as={'label'}
                      cursor={'pointer'}
                      alignItems={'center'}
                      justifyContent={'center'}
                      gap={'3'}
                      px={'3'}
                      py={{ base: '3', md: '6' }}
                    >
                      <Image src={mixPanel.src} h={'8'} w={'8'} />
                      <Flex direction={'column'} gap={0.15}>
                        <Text
                          fontSize={'base'}
                          fontWeight={'500'}
                          lineHeight={'base'}
                        >
                          MixPanel
                        </Text>
                        <Text
                          fontSize={'xs-12'}
                          fontWeight={'400'}
                          lineHeight={'xs-12'}
                          textColor={'grey.200'}
                        >
                          2346780580
                        </Text>
                      </Flex>
                      <Radio ml={'auto'} colorScheme={'radioBlack'} />
                    </Flex>
                  </Flex>
                  <Flex
                    justifyContent={'space-between'}
                    borderBottom={'1px'}
                    borderStyle={'solid'}
                    borderColor={'white.100'}
                    sx={{ margin: '0 !important' }}
                  >
                    <Flex
                      w={'full'}
                      as={'label'}
                      cursor={'pointer'}
                      alignItems={'center'}
                      justifyContent={'center'}
                      gap={'3'}
                      px={'3'}
                      py={{ base: '3', md: '6' }}
                    >
                      <Image src={gaIcon.src} h={'8'} w={'8'} />
                      <Flex direction={'column'} gap={0.15}>
                        <Text
                          fontSize={'base'}
                          fontWeight={'500'}
                          lineHeight={'base'}
                        >
                          Zomato Delivery App
                        </Text>
                        <Flex dir="row" justifyContent="flex-start">
                          <Box width={{ base: '30', md: '40' }}>
                            <Text
                              fontSize={'xs-12'}
                              fontWeight={'400'}
                              lineHeight={'xs-12'}
                              textColor={'grey.200'}
                            >
                              9876345678
                            </Text>
                          </Box>
                          <Text
                            fontSize={'xs-12'}
                            fontWeight={'400'}
                            lineHeight={'xs-12'}
                            textColor={'grey.200'}
                          >
                            GA 4
                          </Text>
                        </Flex>
                      </Flex>

                      <Radio ml={'auto'} colorScheme={'radioBlack'} />
                    </Flex>
                  </Flex>
                  <Flex
                    justifyContent={'space-between'}
                    borderBottom={'1px'}
                    borderStyle={'solid'}
                    borderColor={'white.100'}
                    sx={{ margin: '0 !important' }}
                  >
                    <Flex
                      w={'full'}
                      as={'label'}
                      cursor={'pointer'}
                      alignItems={'center'}
                      justifyContent={'center'}
                      gap={'3'}
                      px={'3'}
                      py={{ base: '3', md: '6' }}
                    >
                      <Image src={gaIcon.src} h={'8'} w={'8'} />
                      <Flex direction={'column'} gap={0.15}>
                        <Text
                          fontSize={'base'}
                          fontWeight={'500'}
                          lineHeight={'base'}
                        >
                          Zomato Delivery App
                        </Text>
                        <Flex dir="row" justifyContent="flex-start">
                          <Box width={{ base: '30', md: '40' }}>
                            <Text
                              fontSize={'xs-12'}
                              fontWeight={'400'}
                              lineHeight={'xs-12'}
                              textColor={'grey.200'}
                            >
                              9876345678
                            </Text>
                          </Box>
                          <Text
                            fontSize={'xs-12'}
                            fontWeight={'400'}
                            lineHeight={'xs-12'}
                            textColor={'grey.200'}
                          >
                            GA 4
                          </Text>
                        </Flex>
                      </Flex>

                      <Radio ml={'auto'} colorScheme={'radioBlack'} />
                    </Flex>
                  </Flex>
                </Stack>
              </RadioGroup>
            </Box>
          </ModalBody>
          <ModalFooter
            pt={{ base: '0', md: '0' }}
            px={{ base: '4', md: '9' }}
            pb={{ base: '4', md: '9' }}
            display={'block'}
          >
            <Flex direction={'column'}>
              <Text
                pt={'6'}
                pb={{ base: '6', md: '9' }}
                fontSize={{ base: 'xs-12', md: 'xs-14' }}
                lineHeight={{ base: 'xs-12', md: 'xs-14' }}
                color={'grey.200'}
                textAlign={'center'}
              >
                Switching the data source reloads the map and clears out your
                previous selection.
              </Text>
              <Link href={'/analytics/app/create'}>
                <Button
                  variant={'primary'}
                  width={'full'}
                  padding={'4'}
                  color={'white'}
                  fontSize={{ base: 'xs-14', md: 'base' }}
                  lineHeight={{ base: 'xs-14', md: 'base' }}
                  height={'auto'}
                  bg={'black'}
                >
                  Update
                </Button>
              </Link>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default dataSource;
