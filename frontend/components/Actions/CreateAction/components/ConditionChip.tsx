import { Button, Text } from '@chakra-ui/react';
import { ConditionType } from '@lib/domain/action';
import React from 'react';

const ConditionChip = ({
  condition,
  addCondition,
  title,
}: {
  condition: ConditionType;
  addCondition: Function;
  title: string;
}) => {
  return (
    <Button
      bg={'white.100'}
      variant={'secondary'}
      p={2}
      mr={1}
      my={1}
      onClick={() => {
        addCondition(condition);
      }}
      data-testid={'condition-chip'}
    >
      <i style={{ fontWeight: 200 }} className="ri-add-fill"></i>{' '}
      <Text ml={1} fontSize={'xs-12'} lineHeight={'xs-16'} fontWeight={500}>
        {title}
      </Text>
    </Button>
  );
};

export default ConditionChip;
