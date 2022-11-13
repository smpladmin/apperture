import { Box, Divider, Flex, Input, Text } from '@chakra-ui/react';
import { Provider } from '@lib/domain/provider';
import Image from 'next/image';
import React, {
  Fragment,
  KeyboardEvent,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import mixPanel from '@assets/images/mixPanel-icon.png';
import gaLogo from '@assets/images/ga-logo-small.svg';
import { MapContext } from '@lib/contexts/mapContext';
import { Item } from '@antv/g6';
import { Actions } from '@lib/types/context';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import { useRouter } from 'next/router';
import { getSearchResult } from '@lib/utils/common';

type SuggestionListProps = {
  suggestion: Item;
  dataSourceType: Provider;
  suggestionsClickHandler: Function;

  active: boolean;
};

const SuggestionsList = ({
  suggestion,
  dataSourceType,
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
      height={{ base: '18', md: '20' }}
      bg={active ? 'white.100' : ''}
      _hover={{
        bg: 'white.100',
      }}
      gap={'3'}
      px={'3'}
      alignItems={'center'}
      ref={active ? searchResultRef : null}
    >
      <Box
        h={{ base: '6', md: '7' }}
        w={{ base: '6', md: '7' }}
        minW={{ base: '6', md: '7' }}
      >
        <Image
          src={dataSourceType === Provider.MIXPANEL ? mixPanel : gaLogo}
          alt="data-source-mix-panel"
          layout="responsive"
        />
      </Box>
      <Text
        fontSize={'base'}
        maxH={'18'}
        alignItems={'center'}
        fontWeight={'medium'}
        lineHeight={{ base: 'xs-14', md: 'base' }}
        wordBreak={'break-word'}
        overflow={'hidden'}
      >
        {suggestion?._cfg?.id}
      </Text>
    </Flex>
  );
};

type SearchSuggestionBoxProps = {
  dataSourceType: Provider;
};

const Search = ({ dataSourceType }: SearchSuggestionBoxProps) => {
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState<Array<Item>>([]);
  const [cursor, setCursor] = useState(-1);
  const searchContainerRef = useRef(null);
  const inputSearchRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { dsId } = router.query;

  useOnClickOutside(searchContainerRef, () => setSuggestions([]));

  const {
    state: { nodesData },
    dispatch,
  } = useContext(MapContext);

  useEffect(() => {
    inputSearchRef?.current?.focus();
    setSearchText('');
  }, [dsId]);

  const onChangeHandler = (text: string) => {
    setSearchText(text);
    const matches = getSearchResult(nodesData, text, {
      keys: [['_cfg', 'id']],
    });
    setSuggestions(matches);
  };

  const setNodeSearchState = () => {
    dispatch({
      type: Actions.SET_IS_NODE_SEARCHED,
      payload: true,
    });
  };

  const suggestionsClickHandler = (suggestion: Item) => {
    setSearchText(suggestion?._cfg?.id!!);
    dispatch({
      type: Actions.SET_ACTIVE_NODE,
      payload: suggestion,
    });
    setNodeSearchState();
    setSuggestions([]);
    setCursor(-1);
  };

  const onSubmit = (searchText: string) => {
    const searchNode = nodesData.find((node) => node._cfg?.id === searchText);
    if (searchNode) {
      suggestionsClickHandler(searchNode);
    }
  };

  const keyboardNavigation = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      suggestions.length &&
        setCursor((c) => (c < suggestions.length - 1 ? c + 1 : 0));
    }
    if (e.key === 'ArrowUp') {
      setCursor((c) => (c > 0 ? c - 1 : suggestions.length - 1));
    }
    if (e.key === 'Enter') {
      if (cursor >= 0) {
        suggestionsClickHandler(suggestions[cursor]);
      } else {
        onSubmit(searchText);
      }
      inputSearchRef.current?.blur();
    }
  };

  return (
    <Flex
      w={{ base: 'full', md: 100 }}
      direction={'column'}
      position={'relative'}
      ref={searchContainerRef}
    >
      <Input
        size={'lg'}
        h={{ base: 10, md: 12 }}
        bg={'white.100'}
        rounded={'25'}
        fontSize={'base'}
        lineHeight={'base'}
        textColor={'black'}
        borderColor={'white.200'}
        textAlign={'left'}
        placeholder="Search for events"
        disabled={!nodesData.length}
        focusBorderColor={'black.100'}
        _placeholder={{
          fontSize: '1rem',
          lineHeight: '1.375rem',
          fontWeight: 400,
          color: 'grey.100',
        }}
        onChange={(e) => onChangeHandler(e.target.value)}
        value={searchText}
        onKeyDown={keyboardNavigation}
        ref={inputSearchRef}
      />

      {suggestions.length ? (
        <Box
          w={'full'}
          overflow={'auto'}
          border={'1px'}
          borderColor={'white.200'}
          bg={'white.DEFAULT'}
          zIndex={'300'}
          position={'absolute'}
          rounded={'16'}
          mt={{ base: '11', md: '13' }}
          pt={{ base: '4', md: '4' }}
          pb={'4'}
          px={'4'}
          maxHeight={{ base: '80', md: '106' }}
        >
          <>
            {suggestions.map((suggestion, i, suggestions) => {
              return (
                <Fragment key={suggestion?._cfg?.id}>
                  <SuggestionsList
                    suggestion={suggestion}
                    suggestionsClickHandler={suggestionsClickHandler}
                    dataSourceType={dataSourceType}
                    active={cursor === i}
                  />
                  {i !== suggestions.length - 1 && (
                    <Divider
                      orientation="horizontal"
                      borderColor={'white.200'}
                      opacity={1}
                    />
                  )}
                </Fragment>
              );
            })}
          </>
        </Box>
      ) : null}
    </Flex>
  );
};
export default Search;
