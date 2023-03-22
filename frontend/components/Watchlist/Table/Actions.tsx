import { Box, Flex, IconButton, Text, useDisclosure } from '@chakra-ui/react';
import ConfirmationModal from '@components/ConfirmationModal';
import Dropdown from '@components/SearchableDropdown/Dropdown';
import { SavedItems } from '@lib/domain/watchlist';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import { CellContext } from '@tanstack/react-table';
import React, { useRef, useState } from 'react';

const Actions = ({
  info,
  handleDelete,
}: {
  info: CellContext<SavedItems, string>;
  handleDelete: Function;
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const id = info?.getValue();
  const dropdownRef = useRef(null);
  useOnClickOutside(dropdownRef, () => setIsDropdownOpen(false));

  return (
    <Box>
      <Box position={'relative'} ref={dropdownRef} w={'fit-content'}>
        <IconButton
          aria-label="more"
          variant={'secondary'}
          icon={<i className="ri-more-fill"></i>}
          rounded={'full'}
          bg={'white.DEFAULT'}
          border={'1px'}
          borderColor={'white.200'}
          onClick={(e) => {
            e.stopPropagation();
            setIsDropdownOpen(true);
          }}
          data-testid={'action-more-icon'}
        />
        <Dropdown
          isOpen={isDropdownOpen}
          dropdownPosition={'right'}
          minWidth={'30'}
        >
          <Flex
            gap={'2'}
            _hover={{ bg: 'white.100' }}
            p={'2'}
            borderRadius={'4'}
            onClick={(e) => {
              e.stopPropagation();
              onOpen();
            }}
            data-testid={'table-action-delete'}
          >
            <i className="ri-delete-bin-line"></i>
            <Text fontSize={'xs-14'} lineHeight={'xs-14'} fontWeight={'400'}>
              Delete
            </Text>
          </Flex>
        </Dropdown>
      </Box>
      <ConfirmationModal
        isOpen={isOpen}
        onClose={onClose}
        headerText={'Delete'}
        bodyText={'Are your sure you want to delete?'}
        primaryButtonText={'Delete'}
        primaryAction={() => {
          handleDelete(id);
          onClose();
        }}
      />
    </Box>
  );
};

export default Actions;
