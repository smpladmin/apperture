import { Box, Text, Textarea } from '@chakra-ui/react';
import SuggestedWord from './SuggestedWord';
import TextareaAutosize from 'react-textarea-autosize';

type EditableTextareaProps = {
  editing: boolean;
  setEditing: React.Dispatch<React.SetStateAction<boolean>>;
  text: string;
  setText: React.Dispatch<React.SetStateAction<string>>;
  tokens: { [key: string]: Array<any> };
  setTokens: React.Dispatch<React.SetStateAction<{}>>;
  selectedProperties: {};
  setSelectedProperties: React.Dispatch<React.SetStateAction<{}>>;
};

export default function EditableTextarea({
  editing,
  setEditing,
  text,
  setText,
  tokens,
  setTokens,
  selectedProperties,
  setSelectedProperties,
}: EditableTextareaProps) {
  const removeToken = (word: string) => {
    setTokens({ ...tokens, [word]: undefined });
  };

  return editing ? (
    <Textarea
      as={TextareaAutosize}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck={false}
      autoFocus
      onChange={(e) => setText(e.target.value)}
      value={text}
      ml={2}
      border={0}
      resize={'none'}
      padding={0}
      minRows={2}
      maxRows={10}
      placeholder="Enter your query here..."
      fontSize={'xs-12'}
      lineHeight={'xs-12'}
      fontWeight={'400'}
      minHeight={'5'}
    />
  ) : (
    <Box ml={2} lineHeight={'sh-18'} mt={-1} onClick={(e) => setEditing(true)}>
      {text ? (
        text.split(' ').map((word: string, index: number) => {
          if (tokens[word]) {
            return (
              <SuggestedWord
                key={index}
                index={index}
                word={word}
                tokens={tokens[word]}
                selectedProperties={selectedProperties}
                setSelectedProperties={setSelectedProperties}
                removeToken={removeToken}
              />
            );
          }
          return (
            <Text
              as={'span'}
              fontSize={'xs-12'}
              lineHeight={'xs-12'}
              fontWeight={'400'}
              key={index}
            >{`${word} `}</Text>
          );
        })
      ) : (
        <Text
          mt={1}
          color={'grey.600'}
          fontSize={'xs-12'}
          fontWeight={'400'}
          lineHeight={'xs-12'}
        >
          Enter your query here...
        </Text>
      )}
    </Box>
  );
}
