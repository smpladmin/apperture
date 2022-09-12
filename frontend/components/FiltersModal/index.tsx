import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Divider,
  Flex,
  Box,
} from '@chakra-ui/react';
import { filtersSchema } from './filtersSchema';
import Filters from './Filters';
import FilterOptions from './FilterOptions';

const FilterModal = () => {
  return (
    <Modal
      isOpen={true}
      onClose={() => {}}
      isCentered
      size={'2xl'}
      trapFocus={false}
    >
      <ModalOverlay backdropFilter={'blur(20px)'} />
      <ModalContent maxWidth="168">
        <ModalHeader
          display={'flex'}
          justifyContent={'space-between'}
          alignItems={'center'}
          pt={10}
          px={9}
        >
          Filters
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
        <ModalBody p={0}>
          <Flex>
            <Filters filters={filtersSchema.filterTypes} />
            <FilterOptions />
          </Flex>
        </ModalBody>
        <Divider
          orientation="horizontal"
          borderColor={'white.200'}
          opacity={1}
        />
        <ModalFooter py={{ base: '3', md: '5' }} px={{ base: '2', md: '5' }}>
          <Flex
            justifyContent={'space-between'}
            alignItems={'center'}
            w={'full'}
          >
            <Text
              fontSize={{ base: 'xs-14', md: 'base' }}
              lineHeight={{ base: 'xs-14', md: 'base' }}
              textDecoration={'underline'}
              cursor={'pointer'}
            >
              Clear all
            </Text>
            <Button
              variant={'primary'}
              rounded={'lg'}
              bg={'black.100'}
              p={6}
              fontSize={'base'}
              fontWeight={'semibold'}
              lineHeight={'base'}
              textColor={'white.100'}
              width={{ base: '25', md: '60' }}
              height={{ base: '12', md: '13' }}
            >
              Apply
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default FilterModal;
