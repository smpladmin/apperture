import {
  Box,
  Button,
  Divider,
  Flex,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useRadio,
  useRadioGroup,
  HStack,
} from '@chakra-ui/react';

function DateRangeRadio({ children }: { children: string }) {
  const { getInputProps, getCheckboxProps } = useRadio();
  const input = getInputProps();
  const checkbox = getCheckboxProps();

  return (
    <Flex as="label" gap={3}>
      <input {...input} />
      <Box
        paddingX={'6'}
        paddingY={'3'}
        cursor={'pointer'}
        {...checkbox}
        _checked={{
          color: 'white',
          backgroundColor: 'black',
          borderRadius: '100px',
        }}
      >
        {children}
      </Box>
    </Flex>
  );
}

function MappedGroup() {
  const list = ['7D', '30D', '3M'];
  const { getRootProps, getRadioProps } = useRadioGroup({
    name: 'Date Filter Range',
    defaultValue: '7D',
    onChange: () => {},
  });

  const group = getRootProps();
  return (
    <HStack {...group}>
      {list.map((item) => (
        <DateRangeRadio key={item} {...getRadioProps({ value: item })}>
          {item}
        </DateRangeRadio>
      ))}
    </HStack>
  );
}

const DateFilter = () => {
  return (
    <Modal
      isOpen={false}
      onClose={() => {}}
      isCentered
      size={'2xl'}
      trapFocus={false}
    >
      <ModalOverlay backdropFilter={'blur(20px)'} bg={'grey.0'} />
      <ModalContent
        maxWidth="168"
        rounded={'2xl'}
        margin={'1rem'}
        maxHeight={'calc(100% - 100px)'}
        bg={'white.DEFAULT'}
      >
        <ModalHeader
          display={'flex'}
          justifyContent={'space-between'}
          alignItems={'center'}
          pt={10}
          px={9}
        >
          Date
          <ModalCloseButton
            position={'relative'}
            top={0}
            right={0}
            border={'1px'}
            borderColor={'white.200'}
            rounded={'full'}
          />
        </ModalHeader>

        <Divider
          orientation="horizontal"
          borderColor={'white.200'}
          opacity={1}
        />
        <ModalBody p={9} overflowY={'auto'}>
          <Box>
            <Text>Showing Data for</Text>
          </Box>
          <Box my={9}>
            <MappedGroup />
          </Box>
          <Flex gap={3}>
            <Box width={'50%'}>
              <Text
                color={'grey.100'}
                fontSize={'xs-14'}
                lineHeight={'xs-14'}
                mb={1}
                fontWeight={'500'}
              >
                Start Date
              </Text>
              <Input
                height={'13'}
                borderWidth={'0'}
                borderRadius={'4'}
                bg={'#F6F6F6'}
                placeholder="Select Date and Time"
                size="sm"
                type="date"
                w={'full'}
                min="2022-06-01"
                max="2022-09-27"
              />
            </Box>
            <Box width={'50%'}>
              <Text
                color={'grey.100'}
                fontSize={'xs-14'}
                lineHeight={'xs-14'}
                mb={1}
                fontWeight={'500'}
              >
                End Date
              </Text>
              <Input
                height={'13'}
                bg={'#F6F6F6'}
                placeholder="Select Date and Time"
                size="sm"
                type="date"
                w={'full'}
                borderWidth={'0'}
                borderRadius={'4'}
                min="2022-06-01"
                max="2022-09-27"
              />
            </Box>
          </Flex>
        </ModalBody>

        <Divider
          orientation="horizontal"
          borderColor={'white.200'}
          opacity={1}
        />
        <ModalFooter py={{ base: '3', md: '5' }} px={{ base: '', md: '6' }}>
          <Button
            variant={'primary'}
            w={'full'}
            rounded={'lg'}
            bg={'black.100'}
            p={6}
            fontSize={'base'}
            fontWeight={'semibold'}
            lineHeight={'base'}
            textColor={'white.100'}
          >
            Apply
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DateFilter;
