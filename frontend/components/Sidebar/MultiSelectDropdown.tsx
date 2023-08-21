import { Avatar, Box, Flex, Input, Text } from '@chakra-ui/react';
import { AppertureUser } from '@lib/domain/user';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import { getSearchResult } from '@lib/utils/common';
import { PaperPlaneTilt, X } from '@phosphor-icons/react';
import React, { ChangeEvent, useRef, useState } from 'react';

const MultiSelectDropdown = ({
  existingUsers,
  selectedValues,
  setSelectedValues,
}: {
  existingUsers: AppertureUser[];
  selectedValues: string[];
  setSelectedValues: Function;
}) => {
  const [input, setInput] = useState('');

  const dropdownContainerRef = useRef(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const [suggestions, setSuggestions] = useState<AppertureUser[]>([]);
  const [isNewUser, setIsNewUser] = useState(false);

  const existingEmails = existingUsers?.map((user) => {
    return user.email;
  });
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);

    const searchResults = getSearchResult(existingUsers, value, {
      threshold: 0.4,
      minMatchCharLength: 2,
      distance: 10,
      keys: ['email'],
    });
    setSuggestions(searchResults);
    if (emailRegex.test(input) && !existingEmails.includes(input)) {
      setIsNewUser(true);
    } else {
      setIsNewUser(false);
    }
  };

  const handleRemoveSelectedValue = (value: string) => {
    const modifiedList = selectedValues.filter((item) => item !== value);
    setSelectedValues(modifiedList);
    inputRef?.current?.focus();
  };

  const submithandler = (value: string) => {
    if (!selectedValues.includes(value)) {
      setSelectedValues((prevValues: any) => [...prevValues, value]);
    }
    setInput('');
    setIsNewUser(false);
    setSuggestions([]);
    inputRef?.current?.focus();
  };

  const handleEmailSubmit = () => {
    if (emailRegex.test(input)) {
      submithandler(input);
    }
  };

  useOnClickOutside(dropdownContainerRef, () => setSuggestions([]));

  return (
    <Box
      position={'relative'}
      h={'auto'}
      border={'1px'}
      borderRadius={'4px'}
      ref={dropdownContainerRef}
    >
      <Box px={'16px'} py={'12px'} h={'auto'}>
        <Flex gap={'2'} flexWrap={'wrap'}>
          {selectedValues.map((value) => (
            <Flex
              key={value}
              p={'8px'}
              borderRadius={'4px'}
              bgColor={'white.400'}
              alignItems={'center'}
              gap={'8px'}
              cursor={'pointer'}
            >
              {existingEmails.includes(value) ? (
                <Avatar
                  name={value}
                  fontWeight={'bold'}
                  size="xs"
                  textColor={'white'}
                  h={5}
                  w={5}
                  fontSize={'xs-10'}
                  lineHeight={'xs-10'}
                />
              ) : (
                <PaperPlaneTilt size={16} />
              )}
              <Text
                fontSize={'xs-14'}
                fontWeight={400}
                lineHeight={'lh-130'}
                key={value}
                wordBreak={'break-word'}
                maxWidth={110}
              >
                {value}
              </Text>
              <X
                size={16}
                onClick={() => {
                  handleRemoveSelectedValue(value);
                }}
              />
            </Flex>
          ))}
          <Flex flexGrow={1}>
            <Input
              ref={inputRef}
              value={input}
              size={'md'}
              variant={'unstyled'}
              w={'100%'}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                e.key === 'Enter' && handleEmailSubmit();
              }}
              autoFocus={true}
            />
          </Flex>
        </Flex>
      </Box>

      <>
        {input ? (
          <Box
            position={'absolute'}
            width={'full'}
            height={'auto'}
            border={'1px'}
            borderColor={'white.200'}
            borderRadius={'4px'}
            zIndex={1}
            py={'2'}
            bg={'white.400'}
            marginTop={'8px'}
          >
            {suggestions?.length ? (
              <>
                {suggestions.map((suggestion) => (
                  <Flex
                    key={suggestion?.id}
                    px={4}
                    py={'6px'}
                    alignItems={'center'}
                    gap={'12px'}
                    cursor={'pointer'}
                    onClick={() => submithandler(suggestion.email)}
                  >
                    <Avatar
                      name={suggestion.firstName}
                      fontWeight={'bold'}
                      size="sm"
                      textColor={'white'}
                      h={{ base: '8', md: '12' }}
                      w={{ base: '8', md: '12' }}
                      fontSize={{ base: 'xs', md: 'xs-14' }}
                      lineHeight={{ base: 'xs', md: 'xs-14' }}
                    />
                    <Flex direction={'column'}>
                      <Text
                        fontSize={'xs-14'}
                        fontWeight={500}
                        lineHeight={'lh-130'}
                      >
                        {`${suggestion.firstName || ''} ${
                          suggestion.lastName || ''
                        }`}
                      </Text>
                      <Text
                        fontSize={'xs-12'}
                        fontWeight={400}
                        lineHeight={'lh-135'}
                        color={'grey.800'}
                      >
                        {suggestion.email}
                      </Text>
                    </Flex>
                  </Flex>
                ))}
              </>
            ) : (
              <>
                {isNewUser ? (
                  <Flex
                    px={4}
                    py={'6px'}
                    alignItems={'center'}
                    gap={'5px'}
                    cursor={'pointer'}
                    onClick={() => submithandler(input)}
                  >
                    <PaperPlaneTilt size={16} color={'grey.900'} />
                    <Text
                      fontSize={'xs-12'}
                      fontWeight={500}
                      lineHeight={'lh-135'}
                      color={'grey.900'}
                    >
                      Invite
                    </Text>
                    <Text
                      fontSize={'xs-12'}
                      fontWeight={400}
                      lineHeight={'lh-135'}
                      color={'grey.800'}
                    >
                      {input}
                    </Text>
                  </Flex>
                ) : (
                  <Flex px={4} py={'6px'} alignItems={'center'} gap={'12px'}>
                    <Text
                      fontSize={'xs-12'}
                      fontWeight={400}
                      lineHeight={'lh-135'}
                      color={'grey.800'}
                    >
                      No matches found. Keep typing a full email address
                    </Text>
                  </Flex>
                )}
              </>
            )}
          </Box>
        ) : null}
      </>
    </Box>
  );
};

export default MultiSelectDropdown;
