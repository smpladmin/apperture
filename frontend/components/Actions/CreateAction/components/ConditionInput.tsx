import { Box, Flex, Input, Text } from '@chakra-ui/react';
import { ConditionType } from '@lib/domain/action';
import React, { useEffect, useState } from 'react';

const ConditionInput = ({
  updateHandler,
  type,
  title,
  placeholder,
  defaultValue = '',
  closeHandler,
  condition,
  hideCloseButton = false,
}: {
  updateHandler: Function;
  type: string;
  condition: ConditionType;
  title: string;
  placeholder: string;
  defaultValue: string | null;
  closeHandler: Function;
  hideCloseButton?: boolean;
}) => {
  const [showCloseButton, setShowCloseButton] = useState(false);

  return (
    <Box
      onMouseEnter={() => setShowCloseButton(true)}
      onMouseLeave={() => setShowCloseButton(false)}
    >
      <Flex alignItems={'center'} justifyContent={'space-between'}>
        <Text
          fontSize={'xs-12'}
          lineHeight={'xs-16'}
          fontWeight={'500'}
          color={'black.150'}
          py={2}
        >
          {title}
        </Text>
        {!hideCloseButton && (
          <i
            hidden={!showCloseButton}
            style={{ cursor: 'pointer', color: '#B2B2B5' }}
            className="ri-close-line"
            onClick={() => closeHandler(condition)}
          />
        )}
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
      />
    </Box>
  );
};

export default ConditionInput;
