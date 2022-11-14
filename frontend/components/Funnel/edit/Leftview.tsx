import {
  Box,
  Button,
  Divider,
  Flex,
  IconButton,
  Text,
  Highlight,
} from '@chakra-ui/react';
import LeftPanel from '@components/EventsLayout/LeftPanel';
import React, { useState } from 'react';
import 'remixicon/fonts/remixicon.css';
import { BASTILLE, BLACK_RUSSIAN } from '@theme/index';

const Leftview = () => {
  const [funnelName, setFunnelName] = useState('Untitled Funnel');
  const [inputFieldsValue, setInputFieldsValue] = useState([
    { eventName: '' },
    { eventName: '' },
  ]);

  const addNewInputField = () => {
    const newField = { eventName: '' };
    setInputFieldsValue([...inputFieldsValue, newField]);
  };

  return (
    <LeftPanel>
      <Flex justifyContent={'space-between'} alignItems={'center'}>
        <IconButton
          aria-label="close"
          variant={'secondary'}
          icon={<i className="ri-arrow-left-line"></i>}
          rounded={'full'}
          color={'white.DEFAULT'}
          bg={'black.20'}
        />

        <Button
          borderRadius={'50'}
          bg={'black.300'}
          borderColor={'grey.300'}
          borderWidth={'1px'}
          color={'white'}
          variant={'primary'}
        >
          <Flex alignItems={'center'} gap={'1'}>
            <i className="ri-edit-fill"></i>
            <Text
              fontSize={'xs-14'}
              lineHeight={'xs-14'}
              fontWeight={'medium'}
              color={'white'}
            >
              Edit
            </Text>
          </Flex>
        </Button>
      </Flex>

      <Flex direction={'column'} mt={'8'} gap={'2'}>
        <Text
          fontSize={{ base: 'sh-20', md: 'sh-32' }}
          lineHeight={{ base: 'sh-20', md: 'sh-32' }}
          fontWeight={'semibold'}
          textColor={'white.DEFAULT'}
          borderColor={'grey.10'}
          px={0}
        >
          Checkout Flow
        </Text>
      </Flex>

      <Flex direction={'column'} mt={'4'}>
        <Flex gap={'4'} alignItems={'center'}>
          <Flex flexDir={'column'} alignItems={'center'}>
            <Box
              bg={'grey.200'}
              w={'7px'}
              h={'7px'}
              borderRadius={'full'}
            ></Box>
            <Box my={'1'} minH={10} w={'1px'} bg={'grey.200'}></Box>
            <Box
              bg={'grey.200'}
              w={'7px'}
              h={'7px'}
              borderRadius={'full'}
            ></Box>
          </Flex>
          <Flex gap={'1'} direction={'column'}>
            <Text color={'white'} fontSize={'xs-14'} lineHeight={'sh-20'}>
              App Launched
            </Text>
            <Text color={'grey.200'} fontSize={'xs-14'} lineHeight={'sh-20'}>
              +4 Steps
            </Text>
            <Text color={'white'} fontSize={'xs-14'} lineHeight={'sh-20'}>
              Cart Page
            </Text>
          </Flex>
        </Flex>
        <Flex mt={'8'} w={'full'} justifyContent={'space-between'}>
          <Box w={20} textAlign={'center'}>
            <IconButton
              minW={{ base: '8', md: '10' }}
              h={{ base: '8', md: '10' }}
              fontWeight={'500'}
              aria-label="set alerts"
              variant={'iconButton'}
              icon={<i className="ri-notification-4-line"></i>}
              rounded={'full'}
              color={'white.DEFAULT'}
              bg={'grey.300'}
            />
            <Text
              mt={2}
              fontSize={{ base: 'xs-10', md: 'xs-12' }}
              lineHeight={{ base: 'xs-10', md: 'xs-12' }}
              color={'grey.DEFAULT'}
            >
              Set Alerts
            </Text>
          </Box>
          <Box w={20} textAlign={'center'}>
            <IconButton
              minW={{ base: '8', md: '10' }}
              h={{ base: '8', md: '10' }}
              fontWeight={'500'}
              aria-label="set alerts"
              variant={'iconButton'}
              icon={<i className="ri-bookmark-line"></i>}
              rounded={'full'}
              color={'white.DEFAULT'}
              bg={'grey.300'}
            />
            <Text
              mt={2}
              fontSize={{ base: 'xs-10', md: 'xs-12' }}
              lineHeight={{ base: 'xs-10', md: 'xs-12' }}
              color={'grey.DEFAULT'}
            >
              Get Updates
            </Text>
          </Box>
          <Box w={20} textAlign={'center'}>
            <IconButton
              minW={{ base: '8', md: '10' }}
              h={{ base: '8', md: '10' }}
              fontWeight={'500'}
              aria-label="set alerts"
              variant={'iconButton'}
              icon={<i className="ri-map-pin-2-line"></i>}
              rounded={'full'}
              color={'white.DEFAULT'}
              bg={'grey.300'}
            />
            <Text
              mt={2}
              fontSize={{ base: 'xs-10', md: 'xs-12' }}
              lineHeight={{ base: 'xs-10', md: 'xs-12' }}
              color={'grey.DEFAULT'}
            >
              Journey Map
            </Text>
          </Box>
          <Box w={20} textAlign={'center'}>
            <IconButton
              minW={{ base: '8', md: '10' }}
              h={{ base: '8', md: '10' }}
              fontWeight={'500'}
              aria-label="set alerts"
              variant={'iconButton'}
              icon={<i className="ri-share-forward-2-line"></i>}
              rounded={'full'}
              color={'white.DEFAULT'}
              bg={'grey.300'}
            />
            <Text
              mt={2}
              fontSize={{ base: 'xs-10', md: 'xs-12' }}
              lineHeight={{ base: 'xs-10', md: 'xs-12' }}
              color={'grey.DEFAULT'}
            >
              Share
            </Text>
          </Box>
        </Flex>
        <Divider
          my={'8'}
          orientation="horizontal"
          borderColor={BASTILLE}
          opacity={1}
        />
        <Flex>
          <Box
            p={4}
            minH={'40'}
            position={'relative'}
            w={'full'}
            bg={'#3E3E47'}
            borderRadius={8}
          >
            <Box>
              <Flex
                w={'full'}
                justifyContent={'space-between'}
                alignItems={'center'}
              >
                <Text
                  color={'grey.100'}
                  fontSize={'xs-12'}
                  lineHeight={'xs-12'}
                >
                  2 mins ago
                </Text>
                <IconButton
                  fontSize={'11'}
                  fontWeight={'400'}
                  color={'black.150'}
                  aria-label="close"
                  bg={'white.100'}
                  minW={'4'}
                  h={'4'}
                  rounded={'full'}
                  icon={<i className="ri-close-fill"></i>}
                ></IconButton>
              </Flex>
              <Box mt={6}>
                <Text
                  color={'white'}
                  fontSize={'xs-14'}
                  lineHeight={'xs-14'}
                  fontWeight={'500'}
                >
                  <Highlight
                    query="Checkout Flow"
                    styles={{
                      px: '1',
                      py: '1',
                      bg: '#2B2B34',
                      fontSize: 'xs-14',
                      fontWeight: '600',
                      color: 'white',
                    }}
                  >
                    Checkout Flow Conversion Rate was
                  </Highlight>
                  <Highlight
                    query="10.7%"
                    styles={{
                      px: '1',
                      py: '1',
                      ml: '1',
                      bg: '#8BE99A',
                      fontSize: 'xs-14',
                      fontWeight: '600',
                      color: 'black',
                    }}
                  >
                    10.7%
                  </Highlight>
                </Text>
                <Text
                  color={'white'}
                  mt={2}
                  fontSize={'xs-14'}
                  lineHeight={'xs-14'}
                  fontWeight={'500'}
                >
                  (2% below average)
                </Text>
              </Box>
            </Box>
          </Box>
        </Flex>
      </Flex>
    </LeftPanel>
  );
};

export default Leftview;
