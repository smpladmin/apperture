import { Box, Flex } from '@chakra-ui/react';
import { highlightFormula } from './util';
import { useCallback, useEffect, useRef } from 'react';

type ContentEditableProp = {
  formula: string;
  setFormula: Function;
  handleSubmitFormula: Function;
  setCaretPosition: React.Dispatch<React.SetStateAction<number>>;
  updateContentEditable: boolean;
  setUpdateContentEditable: React.Dispatch<React.SetStateAction<boolean>>;
};

const ContentEditable = ({
  formula,
  setFormula,
  handleSubmitFormula,
  setCaretPosition,
  updateContentEditable,
  setUpdateContentEditable,
}: ContentEditableProp) => {
  const initialRef = useRef({ formula });
  const contentEditableRef = useRef<HTMLDivElement>(null);

  const moveCaretToEndofText = useCallback(() => {
    if (contentEditableRef?.current) {
      contentEditableRef?.current.focus();

      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(contentEditableRef.current);
      range.collapse(false); // Move the caret to the end of the text
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, []);

  const getCaretPosition = (): number => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(contentEditableRef.current!);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      return preCaretRange.toString().length;
    }
    return 0;
  };

  useEffect(() => {
    setFormula({ currentTarget: { textContent: formula } });
    moveCaretToEndofText();
  }, []);

  useEffect(() => {
    if (!updateContentEditable) {
      return;
    }

    contentEditableRef.current!!.innerText = formula;
    moveCaretToEndofText();

    setUpdateContentEditable(false);
  }, [updateContentEditable]);

  return (
    <Box height={'100%'} outline={'none'}>
      <Flex
        dangerouslySetInnerHTML={{
          __html: highlightFormula(formula).highlightedFormula,
        }}
        position={'absolute'}
        top={0}
        right={0}
        bottom={0}
        left={0}
        px={1}
        fontSize={'xs-12'}
        lineHeight={'xs-12'}
        fontWeight={'600'}
        alignItems={'center'}
        sx={{
          userSelect: 'none',
        }}
        outline={'none'}
      />
      <Box
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        ref={contentEditableRef}
        p={1}
        position={'relative'}
        fontSize={'xs-12'}
        lineHeight={'xs-12'}
        fontWeight={'600'}
        color={'transparent'}
        sx={{
          caretColor: 'black',
        }}
        contentEditable
        suppressContentEditableWarning
        onClick={(e) => {
          e.stopPropagation();
          setCaretPosition(getCaretPosition());
        }}
        onKeyDown={(e) => {
          e.stopPropagation();
          e.code === 'Enter' && handleSubmitFormula();
        }}
        onKeyUp={(e) => {
          e.stopPropagation();
          const caretPosition = getCaretPosition();
          setCaretPosition(caretPosition);
        }}
        onInput={(e) => {
          setFormula(e);
        }}
        outline={'none'}
      >
        {initialRef.current.formula}
      </Box>
    </Box>
  );
};

export default ContentEditable;
