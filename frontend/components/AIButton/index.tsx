import React, { useEffect, useState } from 'react';
import {
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  IconButton,
  PopoverBody,
  forwardRef,
  Box,
  BoxProps,
  Flex,
  useDisclosure,
} from '@chakra-ui/react';
import { PaperPlaneRight, Sparkle, X } from 'phosphor-react';

import { Choice, findMatches } from '@lib/nlp';
import EditableTextarea from './EditableTextarea';
import { WordReplacement } from '@lib/domain/workbook';

type AIButtonProps = BoxProps & {
  properties: Array<string>;
  query?: string;
  wordReplacements?: Array<WordReplacement>;
  onQuery: (query: string, wordSuggestions: Array<WordReplacement>) => void;
};

const AIButton = forwardRef<AIButtonProps, 'div'>((props, ref) => {
  const { properties, query, onQuery, wordReplacements, ...rest } = props;
  const [text, setText] = useState(query || '');
  const [editing, setEditing] = useState(false);
  const [tokens, setTokens] = useState({});
  const [selectedProperties, setSelectedProperties] = useState<{
    [key: string]: string;
  }>({});

  useEffect(() => {
    console.log(wordReplacements);
    const properties = wordReplacements?.reduce(
      (properties: { [key: string]: string }, { word, replacement }) => {
        properties[word] = replacement;
        return properties;
      },
      {}
    );
    setSelectedProperties(properties || {});
  }, [wordReplacements]);

  useEffect(() => {
    if (text) {
      const _tokens = findMatches(text, properties);
      const tokenMap = _tokens.reduce(
        (
          a: { [key: string]: Array<string> },
          b: { word: string; choices: Array<Choice> }
        ) => {
          a[b.word] = b.choices.map((c) => c.choice);
          return a;
        },
        {}
      );
      setTokens(tokenMap);
    }
  }, []);

  const onSubmit = () => {
    setEditing(false);
    const _tokens = findMatches(text, properties);
    const tokenMap = _tokens.reduce(
      (
        a: { [key: string]: Array<string> },
        b: { word: string; choices: Array<Choice> }
      ) => {
        a[b.word] = b.choices.map((c) => c.choice);
        return a;
      },
      {}
    );
    setTokens(tokenMap);
    onQuery(
      text,
      Object.keys(selectedProperties).map((k) => ({
        word: k,
        replacement: selectedProperties[k],
      }))
    );
  };

  const { onOpen, onClose, isOpen } = useDisclosure();
  const firstFieldRef = React.useRef(null);

  return (
    <Box ref={ref} {...rest}>
      <Popover
        placement="top-end"
        isOpen={isOpen}
        initialFocusRef={firstFieldRef}
        onOpen={onOpen}
        onClose={onClose}
        closeOnBlur={false}
      >
        <PopoverTrigger>
          {!isOpen ? (
            <Button
              boxShadow={'xl'}
              _active={{
                boxShadow: 'xl',
              }}
              leftIcon={<Sparkle size={16} color={'#EBAC42'} weight={'fill'} />}
              variant="secondary"
              background={'white'}
              _hover={{
                background: 'white.100',
              }}
              color={'black'}
              rounded={'3xl'}
              border={'1px'}
              borderColor={'grey.700'}
            >
              Ask AI
            </Button>
          ) : (
            <IconButton
              icon={<X size={20} />}
              aria-label="close ask ai button"
              boxShadow={'xl'}
              rounded={'full'}
              background={'white'}
              _hover={{
                background: 'white.100',
                boxShadow: 'xl',
              }}
              _active={{
                boxShadow: 'xl',
              }}
              color={'black'}
              border={'1px'}
              borderColor={'grey.700'}
            />
          )}
        </PopoverTrigger>

        <PopoverContent
          width={'400px'}
          minHeight={'140px'}
          rounded={'xl'}
          bg={'white'}
        >
          <PopoverBody boxShadow="xl" h={'full'} rounded={'xl'} padding={4}>
            <Flex direction={'row'}>
              <Box>
                <Sparkle size={20} color={'#EBAC42'} weight={'fill'} />
              </Box>
              <EditableTextarea
                editing={editing}
                setEditing={setEditing}
                text={text}
                setText={setText}
                tokens={tokens}
                selectedProperties={selectedProperties}
                setSelectedProperties={setSelectedProperties}
              />
            </Flex>
            <Flex direction={'row'} justifyContent={'flex-end'} mt={2}>
              <IconButton
                onClick={onSubmit}
                aria-label="Get data"
                background={'#5093EC'}
                size={'sm'}
                _hover={{
                  background: 'blue.400',
                }}
                icon={
                  <PaperPlaneRight size={20} color={'white'} weight="fill" />
                }
              />
            </Flex>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Box>
  );
});

export default AIButton;
