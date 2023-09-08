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
        <Text display={'inline'} onClick={(e) => e.stopPropagation()}>
          <span style={{ textDecoration: 'underline' }}>{word}</span>
          <span>&nbsp;</span>
        </Text>
      </PopoverTrigger>
      <PopoverContent rounded={'xl'}>
        <PopoverHeader
          bg={'white.400'}
          roundedTop={'xl'}
          onClick={(e) => e.stopPropagation()}
        >
          Select Property
        </PopoverHeader>
        <PopoverBody bg={'white'} onClick={(e) => e.stopPropagation()}>
          <Stack direction="row" wrap={'wrap'}>
            {tokens.map((choice, cIndex) => {
              const selected = selectedProperties[word] === choice;
              return (
                <Flex
                  className="tokens"
                  mb={1}
                  alignItems={'center'}
                  justifyContent={'space-between'}
                  key={cIndex}
                  padding={'2px'}
                  px={'4px'}
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
                    <Box mr={1}>
                      <Check size={20} />
                    </Box>
                  )}
                  {choice}
                </Flex>
              );
            })}
          </Stack>
        </PopoverBody>
        <PopoverFooter
          bg={'white'}
          roundedBottom={'xl'}
          onClick={(e) => e.stopPropagation()}
        >
          <Link
            fontSize={'xs-12'}
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
