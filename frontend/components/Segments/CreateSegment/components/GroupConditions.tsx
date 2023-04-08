import { Flex, Text } from '@chakra-ui/react';
import { GroupConditions } from '@lib/domain/common';
import { SegmentGroup } from '@lib/domain/segment';
import React from 'react';

type GroupConditionsProps = {
  index: number;
  group: SegmentGroup;
  setIsGroupConditionChanged: Function;
  handleGroupConditionsChange: Function;
};

const GroupCondition = ({
  index,
  group,
  handleGroupConditionsChange,
  setIsGroupConditionChanged,
}: GroupConditionsProps) => {
  return (
    <div>
      {group?.condition ? (
        <Flex
          justifyContent={'center'}
          my={group?.condition === GroupConditions.AND ? '-3' : '2'}
        >
          <Text
            px={'2'}
            py={'1'}
            fontSize={'xs-14'}
            lineHeight={'xs-14'}
            fontWeight={'500'}
            bg={'black.50'}
            borderRadius={'4'}
            color={'white.DEFAULT'}
            onClick={() => {
              setIsGroupConditionChanged(true);
              handleGroupConditionsChange(index);
            }}
            h={'6'}
            cursor={'pointer'}
            data-testid={'group-condition'}
          >
            {group?.condition?.toLocaleUpperCase()}
          </Text>
        </Flex>
      ) : null}
    </div>
  );
};

export default GroupCondition;
