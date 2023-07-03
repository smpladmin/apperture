import { Box, Flex, Text, useDisclosure } from '@chakra-ui/react';
import ConfirmationModal from '@components/ConfirmationModal';
import Dropdown from '@components/SearchableDropdown/Dropdown';
import { SavedItems } from '@lib/domain/watchlist';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import { Trash } from '@phosphor-icons/react';
import { CellContext } from '@tanstack/react-table';
import { GREY_500, GREY_600 } from '@theme/index';
import { DotsThreeOutlineVertical, DotsThreeVertical } from 'phosphor-react';
import { useRef, useState } from 'react';

const Actions = ({
  info,
  handleDelete,
  disableDelete = false,
}: {
  info: CellContext<SavedItems, string>;
  handleDelete: Function;
  disableDelete?: boolean;
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const id = info?.getValue();
  const type = info?.row?.original?.type;

  const dropdownRef = useRef(null);
  useOnClickOutside(dropdownRef, () => setIsDropdownOpen(false));

  return (
    <Box>
      <Box position={'relative'} ref={dropdownRef} w={'fit-content'}>
        <DotsThreeOutlineVertical
          size={12}
          color={GREY_600}
          onClick={(e) => {
            e.stopPropagation();
            setIsDropdownOpen(true);
          }}
          weight="fill"
        />
        <Dropdown
          isOpen={isDropdownOpen}
          dropdownPosition={'right'}
          minWidth={'30'}
        >
          <Flex
            gap={'2'}
            alignItems={'center'}
            _hover={{ bg: 'white.100' }}
            p={'2'}
            borderRadius={'4'}
            onClick={(e) => {
              e.stopPropagation();
              onOpen();
            }}
            data-testid={'table-action-delete'}
          >
            <Trash size={16} color={GREY_500} />
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
          handleDelete(id, type);
          onClose();
        }}
      />
    </Box>
  );
};
export default Actions;
