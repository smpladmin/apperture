import { Button, Flex, IconButton } from '@chakra-ui/react';
import React from 'react';
type FormButtonProps = {
  navigateBack: Function;
  handleNextClick: Function;
  disabled: boolean;
  nextButtonName?: string;
};

const FormButton = ({
  navigateBack,
  handleNextClick,
  disabled,
  nextButtonName = 'Next',
}: FormButtonProps) => {
  return (
    <Flex gap={'2'} width={'full'}>
      <IconButton
        aria-label="back"
        icon={<i className="ri-arrow-left-line"></i>}
        rounded={'lg'}
        bg={'white.100'}
        p={6}
        w={'13'}
        onClick={() => navigateBack()}
      />
      <Button
        rounded={'lg'}
        bg={'black.100'}
        p={6}
        fontSize={'base'}
        fontWeight={'semibold'}
        lineHeight={'base'}
        textColor={'white.100'}
        width={{ base: 'full', md: '72' }}
        disabled={disabled}
        onClick={() => handleNextClick()}
      >
        {nextButtonName}
      </Button>
    </Flex>
  );
};

export default FormButton;
