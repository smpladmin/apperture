import { Box, Button, Flex, Text } from '@chakra-ui/react';
import { ConditionType } from '@lib/domain/action';
import React, { useRef, useState } from 'react';

const Description = {
  [ConditionType.text]: 'Text Content inside element',
  [ConditionType.css]:
    'CSS Selector / HTML attribute that uniquely identifies your element.',
  [ConditionType.url]: 'Elements will match only when triggered from the URL.',
  [ConditionType.href]: 'HREF value of hyperlinks',
};

const AddConditionDropdown = ({
  conditionList,
  onClickHandler,
}: {
  conditionList: ConditionType[];
  onClickHandler: Function;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropDownRef = useRef<any>();
  const openDropdown = () => {
    setIsOpen(true);
  };
  const closeDropdown = () => {
    setIsOpen(false);
  };
  const handleClick = (selectedCondition: ConditionType) => {
    closeDropdown();
    onClickHandler(selectedCondition);
  };
  return (
    <Flex ref={dropDownRef} position="relative">
      <Button
        fontSize={'xs-12'}
        lineHeight={'xs-16'}
        fontWeight={500}
        p={1}
        mt={2}
        h={'min-content'}
        bg="none"
        onClick={openDropdown}
      >
        <i className="ri-add-fill"></i>
        <Text ml={1}>Conditions</Text>
      </Button>
      {isOpen && (
        <Box
          position={'absolute'}
          zIndex={1}
          px={'3'}
          py={'3'}
          borderRadius={'12'}
          borderWidth={'0.4px'}
          borderColor={'grey.100'}
          bg={'white.DEFAULT'}
          shadow={'0px 0px 4px rgba(0, 0, 0, 0.12)'}
          maxWidth={'102'}
          overflowY={'auto'}
          top={'100%'}
        >
          {conditionList.map((condition) => (
            <Flex
              key={condition}
              direction={'column'}
              cursor="pointer"
              _hover={{ bg: 'white.100' }}
              p={2}
              borderRadius={4}
              onClick={() => handleClick(condition)}
            >
              <Text
                fontSize={'xs-16'}
                lineHeight={'xs-18'}
                fontWeight={500}
                as={'span'}
                py={1}
              >
                {condition}
              </Text>
              <Text
                fontSize={'xs-12'}
                lineHeight={'xs-14'}
                as={'span'}
                color={'grey.200'}
              >
                {Description[condition]}
              </Text>
            </Flex>
          ))}
        </Box>
      )}
    </Flex>
  );
};

export default AddConditionDropdown;
