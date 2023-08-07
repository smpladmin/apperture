import React from 'react';
import {
  Avatar,
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from '@chakra-ui/react';
import { BLACK, BLUE_800 } from '@theme/index';
import { CaretDown, Check, LockKey } from '@phosphor-icons/react';

type GeneralAccessDropdownProps = {
  options: string[];
  value: string;
  onChange: (newValue: string) => void;
};

const GeneralAccessDropdown = ({
  options,
  value,
  onChange,
}: GeneralAccessDropdownProps) => {
  return (
    <Flex>
      <Menu>
        <Flex gap={'12px'} alignItems={'center'}>
          {value === 'Restricted' ? (
            <Avatar
              fontWeight={'bold'}
              icon={<LockKey size={18} color={BLACK} />}
              size="sm"
              bg={'grey.400'}
              textColor={'white'}
              h={{ base: '8', md: '12' }}
              w={{ base: '8', md: '12' }}
              fontSize={{ base: 'xs', md: 'xs-14' }}
              lineHeight={{ base: 'xs', md: 'xs-14' }}
            />
          ) : (
            <Avatar
              fontWeight={'bold'}
              name={value}
              size="sm"
              textColor={'white'}
              h={{ base: '8', md: '12' }}
              w={{ base: '8', md: '12' }}
              fontSize={{ base: 'xs', md: 'xs-14' }}
              lineHeight={{ base: 'xs', md: 'xs-14' }}
            />
          )}
          <Flex direction={'column'}>
            <MenuButton
              as={Button}
              rightIcon={<CaretDown size={16} />}
              bg={'inherit'}
              _hover={{
                backgroundColor: 'white.400',
              }}
              _active={{
                backgroundColor: 'white.400',
              }}
              fontSize={'xs-14'}
              fontWeight={500}
              lineHeight={'lh-130'}
              textAlign={'left'}
              p={0}
              mr={100}
            >
              {value}
            </MenuButton>
            <Text
              fontSize={'xs-12'}
              fontWeight={400}
              lineHeight={'lh-135'}
              color={'grey.800'}
            >
              {value === 'Restricted'
                ? 'Only invited memebers can access the workspace'
                : `Anyone with a ${value} email address can access this workspace`}
            </Text>
          </Flex>
        </Flex>
        <MenuList p={2}>
          {options.map((option) => (
            <MenuItem
              lineHeight={'lh-130'}
              fontSize={'xs-14'}
              fontWeight={500}
              icon={
                option === value ? <Check size={16} color={BLUE_800} /> : <></>
              }
              key={option}
              paddingLeft={option === value ? 0 : 4}
              onClick={() => {
                onChange(option);
              }}
            >
              {option}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </Flex>
  );
};

export default GeneralAccessDropdown;
