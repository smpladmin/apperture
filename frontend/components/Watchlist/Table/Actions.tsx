import {
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useDisclosure,
} from '@chakra-ui/react';
import ConfirmationModal from '@components/ConfirmationModal';
import { AppertureUser } from '@lib/domain/user';
import { SavedItems } from '@lib/domain/watchlist';
import { CellContext } from '@tanstack/react-table';
import React from 'react';

const Actions = ({
  info,
  handleDelete,
}: {
  info: CellContext<SavedItems, string>;
  handleDelete: Function;
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const id = info?.row?.original?.details?._id;
  return (
    <>
      <Menu>
        <MenuButton onClick={(e) => e.stopPropagation()}>
          <IconButton
            aria-label="more"
            variant={'secondary'}
            icon={<i className="ri-more-fill"></i>}
            rounded={'full'}
            bg={'white.DEFAULT'}
            border={'1px'}
            borderColor={'white.200'}
            onClick={(e) => e.stopPropagation()}
          />
        </MenuButton>
        <MenuList
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <MenuItem
            onClick={(e) => {
              onOpen();
            }}
            _focus={{
              backgroundColor: 'white.100',
            }}
          >
            Delete
          </MenuItem>
        </MenuList>
      </Menu>
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
    </>
  );
};

export default Actions;
