import { Box, Text, Textarea } from '@chakra-ui/react';
import SuggestedWord from './SuggestedWord';
import TextareaAutosize from 'react-textarea-autosize';

type EditableTextareaProps = {
  editing: boolean;
  setEditing: React.Dispatch<React.SetStateAction<boolean>>;
  text: string;
  setText: React.Dispatch<React.SetStateAction<string>>;
  tokens: { [key: string]: Array<any> };
  selectedProperties: {};
  setSelectedProperties: React.Dispatch<React.SetStateAction<{}>>;
};

export default function EditableTextarea({
  editing,
  setEditing,
  text,
  setText,
  tokens,
  selectedProperties,
  setSelectedProperties,
}: EditableTextareaProps) {
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
      minRows={3}
      maxRows={10}
      placeholder="Enter your query here..."
    />
  ) : (
    <Box
      minH={20}
      ml={2}
      lineHeight={'sh-18'}
      onClick={(e) => setEditing(true)}
    >
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
              />
            );
          }
          return <span key={index}>{`${word} `}</span>;
        })
      ) : (
        <Text color={'grey.600'}>Enter your query here...</Text>
      )}
    </Box>
  );
}
