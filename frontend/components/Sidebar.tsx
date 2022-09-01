import styles from '../components/Sidebar.module.css';
import 'remixicon/fonts/remixicon.css';
import logo from '../assets/images/apperture_white-icon.svg';
import logoSmall from '../assets/images/apperture_small-icon.svg';
import Link from 'next/link';
import React from 'react';
import {
  Flex,
  Box,
  Image,
  Text,
  Avatar,
  Divider,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  Radio,
  RadioGroup,
  Stack,
} from '@chakra-ui/react';

const Sidebar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [value, setValue] = React.useState('1');

  return (
    <Flex
      zIndex={1}
      // hidden for now, Need to implement using drawer component
      display={{ base: 'none', md: 'flex' }}
      height={'full'}
      width={{ base: '18.25rem', md: 'full' }}
      maxWidth={{ base: '18.25rem', md: '4rem' }}
      direction={'column'}
      alignItems={{ base: 'flex-start', md: 'center' }}
      flexShrink={'0'}
      flexGrow={'0'}
      backgroundColor={{ base: 'white', md: 'black.100' }}
      textAlign={'center'}
      textColor={{ base: 'black', md: 'white' }}
      fontSize={'base'}
      paddingTop={{ md: 3 }}
      paddingBottom={{ md: 12 }}
    >
      {/*modal box */}
      <Box>
        {/* <Button onClick={onOpen}>Open Modal</Button> */}
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          isCentered
          blockScrollOnMount={true}
        >
          <ModalOverlay />
          <ModalContent padding={{ base: '4', md: '9' }}>
            <ModalHeader
              display={'flex'}
              justifyContent={'space-between'}
              alignItems={'center'}
              p={0}
            >
              My Applications
              <ModalCloseButton position={'relative'} top={'0'} right={'0'} />
            </ModalHeader>

            <ModalBody pt={9}>
              <Box pt={4}>
                <RadioGroup onChange={setValue} value={value}>
                  <Stack direction="column">
                    <Flex
                      paddingY={'4'}
                      justifyContent={'space-between'}
                      alignItems="flex-start"
                      borderBottom={'1px'}
                      borderStyle={'solid'}
                      borderColor={'white.100'}
                    >
                      <Flex textAlign={'left'} gap={'3'}>
                        <Avatar
                          name="Zomato Partner App"
                          fontWeight={'bold'}
                          size="sm"
                          textColor={'white'}
                          h={{ base: '8', md: '12' }}
                          w={{ base: '8', md: '12' }}
                          fontSize={{ base: 'xs', md: 'xs-14' }}
                          lineHeight={{ base: 'xs', md: 'xs-14' }}
                        ></Avatar>
                        <Flex direction={'column'}>
                          <Text
                            fontSize={'base'}
                            fontWeight={'500'}
                            lineHeight={'base'}
                          >
                            Zomato Partner App
                          </Text>
                          <Text
                            fontSize={'xs-14'}
                            fontWeight={'400'}
                            lineHeight={'xs-14'}
                            textColor={'grey.200'}
                          >
                            GA, Mix Panel
                          </Text>
                        </Flex>
                      </Flex>
                      <Radio value="1" />
                    </Flex>
                  </Stack>
                </RadioGroup>
              </Box>
              <Text
                pt={'6'}
                pb={{ base: '6', md: '9' }}
                fontSize={{ base: 'xs-12', md: 'xs-14' }}
                lineHeight={{ base: 'xs-12', md: 'xs-14' }}
                color={'grey.200'}
                textAlign={'center'}
              >
                Switching applications clears out the current configuration and
                filters.
              </Text>
            </ModalBody>

            <ModalFooter p={0}>
              <Button
                width={'full'}
                padding={'4'}
                fontSize={{ base: 'xs-14', md: 'base' }}
                lineHeight={{ base: 'xs-14', md: 'base' }}
                height={'auto'}
                bg={'transparent'}
                border={'1px'}
                borderStyle={'solid'}
                borderColor={'black'}
              >
                + Add Application
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>

      <Box display={{ base: 'block', md: 'none' }}>
        <Image
          src={logoSmall.src}
          alt="appertureLogo"
          width={'7.125rem'}
          height={'auto'}
          paddingX={{ base: '4' }}
          paddingTop={{ base: '4' }}
        />
      </Box>
      <Box display={{ base: 'none', md: 'block' }}>
        <Image
          src={logo.src}
          paddingBottom={'10'}
          alt="appertureLogo"
          width={'1.5rem'}
          height={'auto'}
        />
      </Box>

      <Box display={{ base: 'block', md: 'none' }} width={'full'}>
        <Divider
          orientation="horizontal"
          marginY={'4'}
          borderColor={'white.200'}
          opacity={1}
        />
      </Box>
      <Box
        width={{ base: 'full', md: 'auto' }}
        display={{ base: 'flex', md: 'block' }}
        flexDirection={'column'}
        alignItems={'flex-start'}
      >
        <Text
          fontSize={{ base: 'xs-12', md: 'xs-10' }}
          lineHeight={{ base: 'xs-12', md: 'xs-10' }}
          textColor={{ base: '#B2B2B5', md: 'white' }}
          opacity={{ base: '1', md: '0.3' }}
          paddingX={{ base: '4', md: '0' }}
        >
          APP
        </Text>
        <Flex
          width={'full'}
          paddingX={{ base: '4', md: 'auto' }}
          marginTop={4}
          gap={2}
        >
          <Flex
            marginBottom={{ base: 0, md: 10 }}
            justifyContent={'center'}
            alignItems={'center'}
            borderRadius={100}
            fontWeight={'bold'}
            fontSize={'xs-14'}
            lineHeight={'xs-14'}
          >
            <Avatar
              name="Zomato Partner App"
              fontWeight={'bold'}
              size="sm"
              textColor={'white'}
              h={{ base: 10, md: 8 }}
              w={{ base: 10, md: 8 }}
              fontSize={{ base: 'xs', md: 'xs-14' }}
              lineHeight={'xs-14'}
            ></Avatar>
          </Flex>
          <Box display={{ base: 'block', md: 'none' }} width={'full'}>
            <Flex
              width={'full'}
              gap={2}
              justifyContent={'space-between'}
              alignItems={'center'}
            >
              <Box textAlign={'left'}>
                <Text
                  fontSize={'base'}
                  fontWeight={'semibold'}
                  lineHeight={'base'}
                >
                  Zomato Partner App
                </Text>
                <Text
                  fontSize={'xs-12'}
                  fontWeight={'regular'}
                  lineHeight={'xs-12'}
                >
                  ID 098762
                </Text>
              </Box>
              <IconButton
                aria-label="close"
                icon={<i className="ri-arrow-right-s-line" />}
                bg={'transparent'}
                minWidth={'auto'}
                fontWeight={'inherit'}
                _hover={{
                  backgroundColor: 'transparent',
                }}
                _active={{
                  backgroundColor: 'transparent',
                }}
              />
            </Flex>
          </Box>
        </Flex>
        <Box display={{ base: 'block', md: 'none' }}>
          <Divider
            orientation="horizontal"
            marginY={'4'}
            borderColor={'white.200'}
            opacity={1}
          />
        </Box>
      </Box>
      <Text
        fontSize={{ base: 'xs-12', md: 'xs-10' }}
        lineHeight={{ base: 'xs-12', md: 'xs-10' }}
        textColor={{ base: '#B2B2B5', md: 'white' }}
        opacity={{ base: '1', md: '0.3' }}
        paddingX={{ base: '4', md: 'auto' }}
        paddingBottom={{ base: '4', md: 'auto' }}
      >
        EXPLORE
      </Text>
      <Box display={{ base: 'block', md: 'none' }} width="full">
        <Box width={'full'}>
          <Flex
            width={'full'}
            justifyContent={'flex-start'}
            alignItems={'center'}
            gap={'3'}
            paddingX={'4'}
            paddingY={'5'}
            fontWeight={'400'}
            _hover={{
              backgroundColor: 'white.100',
              fontWeight: '500',
              cursor: 'pointer',
            }}
            _active={{
              backgroundColor: 'transparent',
            }}
          >
            <IconButton
              aria-label="close"
              icon={<i className="ri-route-fill" />}
              minWidth={'auto'}
              bg={'transparent'}
              fontWeight={'inherit'}
              _hover={{
                backgroundColor: 'transparent',
              }}
              _active={{
                backgroundColor: 'transparent',
              }}
            />
            Map
          </Flex>
          <Flex
            width={'full'}
            justifyContent={'space-between'}
            alignItems={'center'}
            paddingX={'4'}
            paddingY={'5'}
            fontWeight={'400'}
            _hover={{
              backgroundColor: 'white.100',
              fontWeight: '500',
              cursor: 'pointer',
            }}
            _active={{
              backgroundColor: 'transparent',
            }}
          >
            <Flex
              width={'full'}
              justifyContent={'flex-start'}
              gap={'3'}
              alignItems={'center'}
            >
              <IconButton
                aria-label="close"
                icon={<i className="ri-lightbulb-line" />}
                minWidth={'auto'}
                bg={'transparent'}
                fontWeight={'inherit'}
                _hover={{
                  backgroundColor: 'transparent',
                }}
                _active={{
                  backgroundColor: 'transparent',
                }}
              />
              Insights
            </Flex>
            <Box
              flexShrink={0}
              borderRadius={'sm'}
              backgroundColor={'green'}
              fontSize={{ base: 'xs-10', md: 'xs-8' }}
              lineHeight={{ base: 'xs-10', md: 'xs-8' }}
              fontWeight={'medium'}
              padding={1}
              textColor={'white'}
            >
              Coming soon
            </Box>
          </Flex>
          <Flex
            width={'full'}
            justifyContent={'space-between'}
            alignItems={'center'}
            paddingX={'4'}
            paddingY={'5'}
            fontWeight={'400'}
            _hover={{
              backgroundColor: 'white.100',
              fontWeight: '500',
              cursor: 'pointer',
            }}
            _active={{
              backgroundColor: 'transparent',
            }}
          >
            <Flex
              width={'full'}
              justifyContent={'flex-start'}
              minWidth={'auto'}
              gap={'3'}
              alignItems={'center'}
            >
              <IconButton
                aria-label="close"
                icon={<i className="ri-bookmark-line" />}
                minWidth={'auto'}
                bg={'transparent'}
                fontWeight={'inherit'}
                _hover={{
                  backgroundColor: 'transparent',
                }}
                _active={{
                  backgroundColor: 'transparent',
                }}
              />
              Saved
            </Flex>
            <Box
              flexShrink={0}
              borderRadius={'sm'}
              backgroundColor={'green'}
              fontSize={{ base: 'xs-10', md: 'xs-8' }}
              lineHeight={{ base: 'xs-10', md: 'xs-8' }}
              fontWeight={'medium'}
              padding={1}
              textColor={'white'}
            >
              Coming soon
            </Box>
          </Flex>
        </Box>
      </Box>
      <Box display={{ base: 'none', md: 'block' }}>
        <Box>
          <Flex
            direction={'column'}
            alignItems={'center'}
            gap={5}
            paddingTop={5}
          >
            <IconButton
              aria-label="close"
              icon={<i className="ri-route-fill" />}
              rounded={'lg'}
              h={{ base: 'auto', md: 10 }}
              w={{ base: 'auto', md: 10 }}
              bg={'black.0'}
              fontWeight={'500'}
              color={'grey.100'}
              _hover={{
                backgroundColor: 'white.0',
                color: 'white',
              }}
              _active={{
                backgroundColor: 'transparent',
              }}
            />

            <IconButton
              aria-label="close"
              icon={<i className="ri-lightbulb-line" />}
              rounded={'lg'}
              h={{ base: 'auto', md: 10 }}
              w={{ base: 'auto', md: 10 }}
              bg={'black.0'}
              fontWeight={'500'}
              color={'grey.100'}
              _hover={{
                backgroundColor: 'white.0',
                color: 'white',
              }}
              _active={{
                backgroundColor: 'transparent',
              }}
            />
            <IconButton
              aria-label="close"
              icon={<i className="ri-bookmark-line" />}
              rounded={'lg'}
              h={{ base: 'auto', md: 10 }}
              w={{ base: 'auto', md: 10 }}
              bg={'black.0'}
              fontWeight={'500'}
              color={'grey.100'}
              _hover={{
                backgroundColor: 'white.0',
                color: 'white',
              }}
              _active={{
                backgroundColor: 'transparent',
              }}
            />
            <Box
              marginTop={-4}
              borderRadius={'sm'}
              backgroundColor={'green'}
              fontSize={'xs-8'}
              lineHeight={'xs-8'}
              fontWeight={'medium'}
              padding={1}
              textColor={'white'}
            >
              Coming soon
            </Box>
          </Flex>
        </Box>
      </Box>
      <Link href={`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/logout`}>
        <Box marginTop={'auto'} width={{ base: 'full', md: 'auto' }}>
          <Box display={{ base: 'block', md: 'none' }}>
            <Flex
              width={'full'}
              justifyContent={'flex-start'}
              alignItems={'center'}
              gap={'3'}
              paddingX={'4'}
              paddingY={'5'}
              fontWeight={'400'}
              backgroundColor={'white'}
              transition={'all 250ms ease'}
              _hover={{
                backgroundColor: 'white.100',
                fontWeight: '500',
                cursor: 'pointer',
              }}
              _active={{
                backgroundColor: 'transparent',
              }}
            >
              <IconButton
                aria-label="close"
                icon={<i className="ri-logout-box-r-line" />}
                bg={'transparent'}
                minWidth={'auto'}
                fontWeight={'inherit'}
                _hover={{
                  backgroundColor: 'transparent',
                }}
                _active={{
                  backgroundColor: 'transparent',
                }}
              />
              Logout
            </Flex>
          </Box>
          <Box display={{ base: 'none', md: 'block' }}>
            <IconButton
              aria-label="close"
              icon={<i className="ri-logout-box-r-line" />}
              rounded={'lg'}
              h={{ base: 'auto', md: 10 }}
              w={{ base: 'auto', md: 10 }}
              bg={'black.0'}
              fontWeight={'500'}
              color={'grey.100'}
              _hover={{
                backgroundColor: 'white.0',
                color: 'white',
              }}
              _active={{
                backgroundColor: 'transparent',
              }}
            />
          </Box>
        </Box>
      </Link>
    </Flex>
  );
};

export default Sidebar;
