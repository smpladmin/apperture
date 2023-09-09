import { Box, Flex } from '@chakra-ui/react';
import { highlightFormula } from './util';
import { useEffect, useRef } from 'react';

const Editable = ({ formula, setFormula, handleSubmitFormula }: any) => {
  const initialRef = useRef({ formula });

  useEffect(() => {
    setFormula({ currentTarget: { textContent: formula } });
  }, []);

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
        ref={(el) => el?.focus()}
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
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          e.code === 'Enter' && handleSubmitFormula();
        }}
        onInput={(e) => {
          setFormula(e);
        }}
        onBlur={(e) => {
          handleSubmitFormula();
        }}
        outline={'none'}
      >
        {initialRef.current.formula}
      </Box>
    </Box>
  );
};

export default Editable;
