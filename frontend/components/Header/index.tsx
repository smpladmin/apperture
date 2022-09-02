import 'remixicon/fonts/remixicon.css';
import Image from 'next/image';
import filterIcon from '@assets/icons/filter-icon.svg';
import mixPanel from '@assets/images/mixPanel-icon.png';
import {
  Box,
  Flex,
  IconButton,
  Input,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
} from '@chakra-ui/react';
import Sidemenu from '../Sidebar/Sidemenu';
import { useContext } from 'react';
import { AppertureContext } from '@lib/contexts/appertureContext';

const Header = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const context = useContext(AppertureContext);

  return (
    <Flex
      h={18}
      w={'100%'}
      alignItems={'center'}
      justifyContent={'space-between'}
      bg={'white.DEFAULT'}
      py={3}
      px={7}
      shadow={'xs'}
    >
      <IconButton
        hidden={!context.device.isMobile}
        aria-label="menu"
        icon={<i className="ri-menu-line"></i>}
        minWidth={'auto'}
        bg={'transparent'}
        onClick={onOpen}
      />
      <Drawer placement="left" isOpen={isOpen} onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerBody px={0}>
            <Sidemenu />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Input
        size={'lg'}
        w={100}
        bg={'white.100'}
        rounded={'6.25rem'}
        fontSize={'base'}
        lineHeight={'base'}
        textColor={'black'}
        borderColor={'white.200'}
        placeholder="Search for events"
        py={4}
        px={3.5}
        _placeholder={{
          fontSize: '1rem',
          lineHeight: '1.375rem',
          fontWeight: 400,
          color: 'grey.100',
        }}
      />
      <Flex alignItems={'center'} justifyContent={'space-between'} gap={6}>
        <Box>
          <i className="ri-calendar-fill"></i>
        </Box>
        <Box>
          <Image src={filterIcon} alt="filter-icon" />
        </Box>
        <Box h={8} w={8}>
          <Image src={mixPanel} alt="data-source-mix-panel" />
        </Box>
      </Flex>
    </Flex>
  );
};

export default Header;
