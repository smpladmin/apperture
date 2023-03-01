import { Box, Input, Text } from '@chakra-ui/react';
import React from 'react';

const ConditionInput = ({
  updateHandler,
  type,
  title,
  placeholder,
  defaultValue = '',
}: {
  updateHandler: Function;
  type: string;
  title: string;
  placeholder: string;
  defaultValue?: string;
}) => {
  return (
    <Box>
      <Text
        fontSize={'xs-12'}
        lineHeight={'xs-16'}
        fontWeight={'500'}
        color={'black.150'}
        py={2}
      >
        {title}
      </Text>
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
        defaultValue={defaultValue}
        onChange={(e) => updateHandler(e.target.value, type)}
        border={'none'}
        fontSize={'xs-12'}
        lineHeight={'xs-16'}
      />
    </Box>
  );
};

export default ConditionInput;
