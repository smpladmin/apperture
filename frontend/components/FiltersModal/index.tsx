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
} from '@chakra-ui/react';
import { filtersSchema } from './filtersSchema';
import FilterCategories from './FilterCategories';
import FilterOptions from './FilterOptions';
import { useState } from 'react';
import { FilterTypes, Filters as FiltersClass } from '@lib/domain/filters';

const FiltersModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [selectedFilters, setSelectedFilters] = useState(new FiltersClass());
  const [currentFilter, setCurrentFilter] = useState<FilterTypes>(
    filtersSchema.filterTypes[0].subSections[0].id as FilterTypes
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
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
        <ModalBody p={0} overflowY={'auto'}>
          <Flex>
            <FilterCategories
              // @ts-ignore
              filters={filtersSchema.filterTypes}
              setCurrentFilter={setCurrentFilter}
              currentFilter={currentFilter}
              selectedFilters={selectedFilters}
            />
            <FilterOptions
              // @ts-ignore
              options={filtersSchema.filterOptions}
              currentFilter={currentFilter}
              setSelectedFilter={setSelectedFilters}
              selectedFilters={selectedFilters}
            />
          </Flex>
        </ModalBody>
        <Divider
          orientation="horizontal"
          borderColor={'white.200'}
          opacity={1}
        />
        <ModalFooter
          py={{ base: '3', md: '5' }}
          pl={{ base: '6', md: '9' }}
          pr={{ base: '2', md: '9' }}
        >
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
              onClick={() => setSelectedFilters(new FiltersClass())}
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

export default FiltersModal;
