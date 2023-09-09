import {
  Box,
  Flex,
  Link,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
  Stack,
  Text,
} from '@chakra-ui/react';
import { Check } from 'phosphor-react';
import React from 'react';

type SuggestedWordProps = {
  index: number;
  word: string;
  tokens: Array<any>;
  selectedProperties: { [key: string]: string };
  setSelectedProperties: React.Dispatch<React.SetStateAction<{}>>;
  removeToken: (word: string) => void;
};

export default function SuggestedWord({
  index,
  word,
  tokens,
  selectedProperties,
  setSelectedProperties,
  removeToken,
}: SuggestedWordProps) {
  return (
    <Popover trigger={'hover'} key={index}>
      <PopoverTrigger>
        <Text
          display={'inline'}
          onClick={(e) => e.stopPropagation()}
          fontSize={'xs-12'}
        >
          <span style={{ textDecoration: 'underline' }}>{word}</span>
          <span>&nbsp;</span>
        </Text>
      </PopoverTrigger>
      <PopoverContent rounded={'xl'}>
        <PopoverHeader
          bg={'white.400'}
          roundedTop={'xl'}
          fontSize={'xs-12'}
          onClick={(e) => e.stopPropagation()}
        >
          Select Property
        </PopoverHeader>
        <PopoverBody bg={'white'} onClick={(e) => e.stopPropagation()}>
          <Flex direction="row" wrap={'wrap'} gap={2}>
            {tokens.map((choice, cIndex) => {
              const selected = selectedProperties[word] === choice;
              return (
                <Flex
                  fontSize={'xs-10'}
                  alignItems={'center'}
                  justifyContent={'space-between'}
                  key={cIndex}
                  px={1.5}
                  border={'1px'}
                  rounded={'md'}
                  borderColor={selected ? 'black' : 'white.200'}
                  color={selected ? 'black' : 'grey.500'}
                  bg={selected ? 'white.200' : 'white'}
                  cursor={'pointer'}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProperties({
                      ...selectedProperties,
                      [word]: choice,
                    });
                  }}
                >
                  {selected && (
                    <Box>
                      <Check size={12} />
                    </Box>
                  )}
                  {choice}
                </Flex>
              );
            })}
          </Flex>
        </PopoverBody>
        <PopoverFooter
          bg={'white'}
          roundedBottom={'xl'}
          onClick={(e) => e.stopPropagation()}
        >
          <Link
            fontSize={'xs-10'}
            textDecoration={'underline'}
            color={'grey.500'}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedProperties({
                ...selectedProperties,
                [word]: undefined,
              });
              removeToken(word);
            }}
          >
            Remove token
          </Link>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  );
}
