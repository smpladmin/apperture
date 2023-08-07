import { Box, Flex, Input, Text } from '@chakra-ui/react';
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

  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);

    const searchResults = getSearchResult(
      existingUsers.map((user) => {
        return user.email;
      }),
      value,
      {}
    );
    setSuggestions(searchResults);
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
    setSuggestions([]);
    inputRef?.current?.focus();
  };

  const handleEmailSubmit = () => {
    //Todo basic email validation
    if (true) {
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
              <PaperPlaneTilt size={16} />
              <Text
                fontSize={'xs-14'}
                fontWeight={400}
                lineHeight={'lh-130'}
                key={value}
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
          <Input
            ref={inputRef}
            value={input}
            size={'md'}
            variant={'unstyled'}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              e.key === 'Enter' && handleEmailSubmit();
            }}
            autoFocus={true}
          />
        </Flex>
      </Box>

      {suggestions?.length ? (
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
          {suggestions.map((suggestion) => (
            <Flex
              key={suggestion}
              px={4}
              py={'6px'}
              alignItems={'center'}
              gap={'5px'}
              cursor={'pointer'}
            >
              <PaperPlaneTilt size={16} />
              <Text
                color={'grey.900'}
                fontSize={'xs-12'}
                fontWeight={400}
                lineHeight={'lh-135'}
              >
                Invite
              </Text>
              <Text
                color={'grey.800'}
                fontSize={'xs-12'}
                fontWeight={400}
                lineHeight={'lh-135'}
                key={suggestion}
                onClick={() => submithandler(suggestion)}
              >
                {suggestion}
              </Text>
            </Flex>
          ))}
        </Box>
      ) : null}
    </Box>
  );
};

export default MultiSelectDropdown;
