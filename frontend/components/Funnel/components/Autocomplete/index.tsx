import {
  Box,
  Divider,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
} from '@chakra-ui/react';
import Image from 'next/image';
import React, {
  Fragment,
  KeyboardEvent,
  useContext,
  useRef,
  useState,
} from 'react';
import HorizontalParallelLineIcon from '@assets/icons/horizontal-parallel-line.svg';
import CrossIcon from '@assets/icons/cross-icon.svg';
import FunnelIcon from '@assets/icons/funnel-icon.svg';
import SuggestionsList from './SuggestionsList';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import { NodeType } from '@lib/types/graph';
import { FunnelStep } from '@lib/domain/funnel';
import { isValidNonEmptyStep } from '@components/Funnel/util';
import { MapContext } from '@lib/contexts/mapContext';

type AutocompleteProps = {
  data: FunnelStep;
  index: number;
  handleInputChangeValue: Function;
  removeInputField: Function;
  showCrossIcon: boolean;
  suggestions: NodeType[];
  setSuggestions: Function;
  focusedInputIndex: number;
  setFocusedInputIndex: Function;
  getFunnelData: Function;
};

const Autocomplete = ({
  data,
  index,
  handleInputChangeValue,
  removeInputField,
  showCrossIcon,
  suggestions,
  setSuggestions,
  focusedInputIndex,
  setFocusedInputIndex,
  getFunnelData,
}: AutocompleteProps) => {
  const {
    state: { nodes },
  } = useContext(MapContext);
  const [cursor, setCursor] = useState(-1);
  const inputSearchRef = useRef<HTMLInputElement>(null);
  const suggestionsContainerRef = useRef(null);

  const removeInvalidStep = () => {
    if (!isValidNonEmptyStep(data?.['event'], nodes)) {
      removeInputField(index);
    }
  };

  useOnClickOutside(suggestionsContainerRef, () => {
    removeInvalidStep();
    setSuggestions([]);
  });

  const suggestionsSubmitHandler = (suggestion: NodeType) => {
    handleInputChangeValue(suggestion?.id, focusedInputIndex);
    getFunnelData();
    setSuggestions([]);
    setCursor(-1);
  };

  const handlEnterKeyPressed = () => {
    removeInvalidStep();
    setSuggestions([]);
    getFunnelData();
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
        suggestionsSubmitHandler(suggestions?.[cursor]);
      } else {
        handlEnterKeyPressed();
      }
      inputSearchRef.current?.blur();
    }
  };

  return (
    <Flex direction={'column'} position={'relative'} pb={'4'}>
      <InputGroup>
        <InputLeftElement
          cursor={'move'}
          h={'12'}
          display={'flex'}
          alignItems={'center'}
        >
          <Flex justifyContent={'center'}>
            <Image
              src={HorizontalParallelLineIcon}
              alt={'parallel-line-icon'}
            />
          </Flex>
        </InputLeftElement>
        <Input
          py={'4'}
          size={'lg'}
          type={'text'}
          fontSize={'xs-14'}
          lineHeight={'xs-14'}
          fontWeight={'medium'}
          textColor={'white.DEFAULT'}
          bg={'black.50'}
          border={'0'}
          borderRadius={'200'}
          placeholder={'Add event'}
          autoFocus
          focusBorderColor={'white.DEFAULT'}
          ref={inputSearchRef}
          _placeholder={{
            fontSize: 'xs-14',
            lineHeight: 'xs-14',
            fontWeight: 400,
            color: 'grey.200',
          }}
          value={data?.event}
          onChange={(e) => handleInputChangeValue(e.target.value, index)}
          onFocus={() => {
            setFocusedInputIndex(index);
          }}
          onKeyDown={keyboardNavigation}
          data-testid={`autocomplete`}
        />
        <InputRightElement
          color={'white'}
          cursor={'pointer'}
          h={'12'}
          alignItems={'center'}
          pl={'4'}
          pr={'4'}
        >
          <Flex gap={'2'} alignItems={'center'} pr={'4'}>
            <Box minH={'4'} minW={'4'} p={'1px'} cursor={'not-allowed'}>
              <Image src={FunnelIcon} alt={'filter'} />
            </Box>
            {showCrossIcon ? (
              <Box
                minH={'5'}
                minW={'5'}
                data-testid={`remove-button ${index}`}
                onClick={() => removeInputField(index)}
              >
                <Image src={CrossIcon} alt={'cross-icon'} />
              </Box>
            ) : null}
          </Flex>
        </InputRightElement>
      </InputGroup>
      {index === focusedInputIndex && suggestions.length ? (
        <Box
          position={'absolute'}
          mt={'14'}
          w={'full'}
          border={'2px'}
          borderColor={'black'}
          bg={'white.DEFAULT'}
          zIndex={'10'}
          borderRadius={'12'}
          overflow={'auto'}
          maxHeight={{ base: '80', md: '108' }}
          pt={'2'}
          pb={'4'}
          ref={suggestionsContainerRef}
        >
          {suggestions.map((suggestion: NodeType, i: number) => {
            return (
              <Fragment key={i}>
                {i === 0 ? (
                  <Divider
                    orientation="horizontal"
                    borderColor={'white.200'}
                    opacity={1}
                  />
                ) : null}
                <SuggestionsList
                  suggestion={suggestion}
                  suggestionsSubmitHandler={suggestionsSubmitHandler}
                  active={cursor === i}
                />
                <Divider
                  orientation="horizontal"
                  borderColor={'white.200'}
                  opacity={1}
                />
              </Fragment>
            );
          })}
        </Box>
      ) : null}
    </Flex>
  );
};
export default Autocomplete;
