import { Flex, Text } from '@chakra-ui/react';
import { NodeType } from '@lib/types/graph';
import React, { useEffect, useRef } from 'react';

type SuggestionListProps = {
  suggestion: NodeType;
  suggestionsClickHandler: Function;
  active: boolean;
};

const SuggestionsList = ({
  suggestion,
  suggestionsClickHandler,
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
      onClick={() => suggestionsClickHandler(suggestion)}
      cursor={'pointer'}
      h={'auto'}
      minHeight={{ base: '18', md: '15' }}
      bg={active ? 'white.100' : ''}
      _hover={{
        bg: 'white.100',
      }}
      alignItems={'center'}
      px={'6'}
      ref={active ? searchResultRef : null}
    >
      <Text
        fontSize={'base'}
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
