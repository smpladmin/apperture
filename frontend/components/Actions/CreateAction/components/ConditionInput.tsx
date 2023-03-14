import { Box, Button, Flex, Input, Text } from '@chakra-ui/react';
import { ConditionType } from '@lib/domain/action';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import React, { useEffect, useRef, useState } from 'react';

const ConditionInput = ({
  updateHandler,
  type,
  title,
  placeholder,
  defaultValue = '',
  closeHandler,
  condition,
  hideCloseButton = false,
  showCriteriaDropdown = false,
  criteriaDropdownList = [],
  currentCriteria,
  dropDownHandler,
  isDisabled = false,
}: {
  updateHandler: Function;
  type: string;
  condition: ConditionType;
  title: string;
  placeholder: string;
  defaultValue: string | null;
  closeHandler: Function;
  hideCloseButton?: boolean;
  showCriteriaDropdown?: boolean;
  criteriaDropdownList?: string[];
  currentCriteria?: string;
  dropDownHandler?: Function;
  isDisabled: Boolean;
}) => {
  const [showCloseButton, setShowCloseButton] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const dropDownRef = useRef<any>();
  const handleDropdownClick = () => {
    setIsOpen((state) => !state);
  };
  const closeDropdown = () => {
    setIsOpen(false);
  };
  useOnClickOutside(dropDownRef, closeDropdown);

  const onClickHandler = (value: string) => {
    dropDownHandler && dropDownHandler(value);
    closeDropdown();
  };

  return (
    <Box
      onMouseEnter={() => !isDisabled && setShowCloseButton(true)}
      onMouseLeave={() => !isDisabled && setShowCloseButton(false)}
    >
      <Flex
        position={'relative'}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        <Text
          fontSize={'xs-12'}
          lineHeight={'xs-16'}
          fontWeight={'500'}
          color={'black.150'}
          py={2}
        >
          {title}
        </Text>

        <Flex
          cursor={'pointer'}
          onClick={handleDropdownClick}
          ref={dropDownRef}
          zIndex={1}
          position="relative"
        >
          {showCriteriaDropdown && !isDisabled && (
            <>
              <Text fontSize={'xs-12'} lineHeight={'xs-16'} fontWeight={600}>
                {currentCriteria}
              </Text>
              <i className="ri-arrow-down-s-fill"></i>
              {isOpen && (
                <Flex
                  position={'absolute'}
                  direction={'column'}
                  top={'100%'}
                  right={0}
                  bg={'white.DEFAULT'}
                  px={1}
                  py={2}
                  borderColor="white.200"
                  borderWidth={'1px'}
                  w="max-content"
                  borderRadius={8}
                >
                  {criteriaDropdownList.map((value, index) => (
                    <Text
                      key={value + index}
                      as="span"
                      fontSize={'xs-12'}
                      lineHeight={'xs-16'}
                      fontWeight={400}
                      onClick={(e) => {
                        e.stopPropagation();
                        onClickHandler(value);
                      }}
                      _hover={{ bg: 'white.100' }}
                      pr={3}
                      pl={1}
                    >
                      {value}
                    </Text>
                  ))}
                </Flex>
              )}
            </>
          )}
          {!hideCloseButton && (
            <i
              hidden={!showCloseButton}
              style={{
                cursor: 'pointer',
                color: '#B2B2B5',
                position: showCriteriaDropdown ? 'absolute' : 'static',
                left: '100%',
              }}
              className="ri-close-line"
              onClick={() => closeHandler(condition)}
            />
          )}
          {isDisabled && (
            <Text
              as="span"
              fontSize={'xs-12'}
              lineHeight={'xs-16'}
              fontWeight={400}
              pr={3}
              pl={1}
            >
              {currentCriteria}
            </Text>
          )}
        </Flex>
      </Flex>
      <Input
        px={'3'}
        py={'2'}
        placeholder={placeholder}
        focusBorderColor="black.100"
        _placeholder={{
          fontSize: 'xs-12',
          lineHeight: 'xs-16',
          fontWeight: '500',
          color: 'grey.100',
        }}
        bg={'white.100'}
        data-testid={`${type}-selector-input`}
        onChange={(e) => {
          updateHandler(e.target.value, type);
        }}
        border={'none'}
        fontSize={'xs-12'}
        lineHeight={'xs-16'}
        defaultValue={defaultValue || ''}
        disabled={Boolean(isDisabled)}
      />
    </Box>
  );
};

export default ConditionInput;
