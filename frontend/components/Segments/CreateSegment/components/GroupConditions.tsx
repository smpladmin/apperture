import { Flex, Text } from '@chakra-ui/react';
import { SegmentGroupConditions } from '@lib/domain/segment';
import React from 'react';

type GroupConditionsProps = {
  index: number;
  groupConditions: SegmentGroupConditions[];
  handleGroupConditionsChange: Function;
};

const GroupCondition = ({
  index,
  groupConditions,
  handleGroupConditionsChange,
}: GroupConditionsProps) => {
  return (
    <div>
      {groupConditions[index] ? (
        <Flex
          justifyContent={'center'}
          my={
            groupConditions[index] === SegmentGroupConditions.AND ? '-3' : '2'
          }
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
              handleGroupConditionsChange(index);
            }}
            h={'6'}
            cursor={'pointer'}
            data-testid={'group-condition'}
          >
            {groupConditions[index].toLocaleUpperCase()}
          </Text>
        </Flex>
      ) : null}
    </div>
  );
};

export default GroupCondition;
