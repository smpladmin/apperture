import { Box, Button, Flex, Text } from '@chakra-ui/react';
import React, { useRef, useState } from 'react';
import ReactCodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { useRouter } from 'next/router';
import LoadingSpinner from '@components/LoadingSpinner';

type QueryEditorProps = {
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  error: string;
  handleRunQuery: Function;
  isLoading: boolean;
};

const QueryEditor = ({
  query,
  setQuery,
  error,
  handleRunQuery,
  isLoading,
}: QueryEditorProps) => {
  const router = useRouter();
  const { dsId } = router.query;
  const abortControllerRef = useRef<{
    controller: AbortController;
    id: string;
  } | null>(null);

  return (
    <Box borderBottom={'0.4px solid #BDBDBD'}>
      <Box
        bg={'white.500'}
        border={'0'}
        borderBottom={'0.4px solid #BDBDBD'}
        px={'5'}
        py={'4'}
      >
        <Text fontSize={'xs-14'} lineHeight={'xs-14'} fontWeight={'600'}>
          SQL Query
        </Text>
      </Box>
      <Box pt={'6'} pb={'4'} px={'5'}>
        <ReactCodeMirror
          value={query}
          height={'262px'}
          extensions={[sql()]}
          onChange={(value) => {
            setQuery(value);
          }}
        />
        {error ? (
          <Text
            fontSize={'xs-12'}
            lineHeight={'xs-16'}
            fontWeight={400}
            color={'red'}
            data-testid={'error-text'}
          >
            {error}
          </Text>
        ) : null}
        <Flex justifyContent={'flex-end'} w={'full'} pt={'2'}>
          <Button
            fontSize={'xs-14'}
            lineHeight={'xs-14'}
            fontWeight={'500'}
            bg={'blue.50'}
            onClick={() => !isLoading && handleRunQuery()}
            isDisabled={isLoading}
          >
            <Flex gap={'1'}>
              {isLoading ? <LoadingSpinner size={'sm'} /> : null}
              Run
            </Flex>
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};

export default QueryEditor;
