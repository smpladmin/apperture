import {
  Avatar,
  Box,
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  Stack,
  Text,
  Divider,
} from '@chakra-ui/react';
import React from 'react';

const AppsModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [value, setValue] = React.useState('1');
  const [size, setSize] = React.useState('2xl');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      blockScrollOnMount={true}
      size={'2xl'}
    >
      <ModalOverlay />
      <ModalContent margin={'1rem'}>
        <ModalHeader
          display={'flex'}
          justifyContent={'space-between'}
          alignItems={'center'}
          pt={10}
          px={9}
        >
          My Applications
          <ModalCloseButton position={'relative'} top={'0'} right={'0'} />
        </ModalHeader>
        <Divider
          orientation="horizontal"
          marginY={'4'}
          borderColor={'white.200'}
          opacity={1}
        />

        <ModalBody px={6}>
          <Box>
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
                  <Radio colorScheme="black.DEFAULT" value="1" />
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
        <ModalFooter pt={0} px={6}>
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
  );
};

export default AppsModal;
