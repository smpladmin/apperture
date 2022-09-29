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
      height={'20'}
      alignItems={'center'}
      bg={active ? 'white.100' : ''}
      _hover={{
        bg: 'white.100',
      }}
      gap={'3'}
      px={'3'}
      ref={active ? searchResultRef : null}
    >
      <Box h={'8'} w={'8'}>
        <Image
          src={dataSourceType === Provider.MIXPANEL ? mixPanel : gaLogo}
          alt="data-source-mix-panel"
        />
      </Box>

      <Text
        fontSize={'base'}
        fontWeight={'medium'}
        lineHeight={'base'}
        wordBreak={'break-word'}
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

  const {
    state: { visualisationData },
    dispatch,
  } = useContext(MapContext);

  const onChangeHandler = (text: string) => {
    let matches: Item[] = [];
    if (text) {
      matches = visualisationData.filter((item: Item) => {
        return (
          item?._cfg?.id!!.toLowerCase().startsWith(text.toLowerCase()) ||
          item?._cfg?.id!!.toLowerCase().includes(text.toLowerCase())
        );
      });
      matches.sort((a, b) => a._cfg?.id?.length!! - b._cfg?.id?.length!!);
      setCursor(-1);
    }
    setSuggestions(matches);
    setSearchText(text);
  };

  const suggestionsClickHandler = (suggestion: Item) => {
    setSearchText(suggestion?._cfg?.id!!);
    dispatch({
      type: Actions.SET_ACTIVE_NODE,
      payload: suggestion,
    });
    setSuggestions([]);
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
        setSearchText(suggestions[cursor]?._cfg?.id!!);
        dispatch({
          type: Actions.SET_ACTIVE_NODE,
          payload: suggestions[cursor],
        });
        setSuggestions([]);
        setCursor(-1);
      } else {
        const searchNode = visualisationData.find(
          (node) => node._cfg?.id === searchText
        );
        if (searchNode) {
          dispatch({
            type: Actions.SET_ACTIVE_NODE,
            payload: searchNode,
          });
          setSuggestions([]);
        }
      }
    }
  };

  return (
    <Flex
      w={{ base: 'full', md: 100 }}
      py={4}
      direction={'column'}
      position={'relative'}
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
        disabled={!visualisationData.length}
        _placeholder={{
          fontSize: '1rem',
          lineHeight: '1.375rem',
          fontWeight: 400,
          color: 'grey.100',
        }}
        onChange={(e) => onChangeHandler(e.target.value)}
        value={searchText}
        onBlur={() => {
          setTimeout(() => {
            setSuggestions([]);
            setCursor(-1);
          }, 200);
        }}
        onKeyDown={keyboardNavigation}
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
          mt={'13'}
          pt={'7'}
          pb={'5'}
          px={'6'}
          maxHeight={'112'}
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
