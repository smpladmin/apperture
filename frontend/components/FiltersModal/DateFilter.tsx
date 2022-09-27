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
} from '@chakra-ui/react';

const DateFilter = () => {
  return (
    <Modal
      isOpen={true}
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
        <ModalBody p={0} overflowY={'auto'}>
          <Input
            placeholder="Select Date and Time"
            size="sm"
            type="date"
            w={'50'}
            min="2022-06-01"
            max="2022-09-27"
          />
        </ModalBody>
        <Divider
          orientation="horizontal"
          borderColor={'white.200'}
          opacity={1}
        />
        <ModalFooter py={{ base: '3', md: '5' }} px={{ base: '', md: '6' }}>
          <Button
            variant={'primary'}
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
