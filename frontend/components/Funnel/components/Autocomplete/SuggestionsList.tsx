import { Flex, Text } from '@chakra-ui/react';
import { NodeType } from '@lib/types/graph';
import React, { useEffect, useRef } from 'react';

type SuggestionListProps = {
  suggestion: NodeType;
  suggestionsSubmitHandler: Function;
  active: boolean;
};

const SuggestionsList = ({
  suggestion,
  suggestionsSubmitHandler,
  active,
}: SuggestionListProps) => {
  const searchResultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!searchResultRef.current) return;
    searchResultRef.current?.scrollIntoView({
      block: 'center',
    });
  }, [active]);

  return (
    <Flex
      onClick={() => suggestionsSubmitHandler(suggestion)}
      cursor={'pointer'}
      h={'auto'}
      minHeight={'16'}
      bg={active ? 'white.100' : ''}
      _hover={{
        bg: 'white.100',
      }}
      alignItems={'center'}
      px={'6'}
      ref={active ? searchResultRef : null}
    >
      <Text
        fontSize={{ base: 'xs-14', md: 'base' }}
        w={'full'}
        alignItems={'center'}
        fontWeight={active ? 'semibold' : 'medium'}
        lineHeight={{ base: 'xs-14', md: 'base' }}
        wordBreak={'break-word'}
        overflow={'hidden'}
        _hover={{
          fontWeight: 'semibold',
        }}
      >
        {suggestion?.id}
      </Text>
    </Flex>
  );
};

export default SuggestionsList;
