import {
  Button,
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  Text,
} from '@chakra-ui/react';
import React, { ChangeEvent, useState } from 'react';

const CreateFunnel = () => {
  const [inputFieldsValue, setInputFieldsValue] = useState([
    { eventName: '' },
    { eventName: '' },
  ]);

  const addNewInputField = () => {
    const newField = { eventName: '' };
    setInputFieldsValue([...inputFieldsValue, newField]);
  };

  const removeInputField = (index: number) => {
    if (inputFieldsValue.length === 2) return;
    let deletedInputValues = [...inputFieldsValue];
    console.log(index);
    deletedInputValues.splice(index, 1);
    setInputFieldsValue(deletedInputValues);
  };

  const handleInputChangeValue = (
    e: ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const inputValues = [...inputFieldsValue];
    inputValues[index]['eventName'] = e.target.value;
    setInputFieldsValue(inputValues);
  };
  console.log(inputFieldsValue);

  return (
    <Flex direction={'column'} gap={'4'}>
      <Flex justifyContent={'space-between'} alignItems={'center'}>
        <Text
          fontSize={'sh-24'}
          lineHeight={'sh-24'}
          fontWeight={'normal'}
          color={'white.DEFAULT'}
        >
          Steps
        </Text>
        <Button
          rounded={'full'}
          variant={'primary'}
          size={'md'}
          bg={'rgba(255, 255, 255, 0.05)'}
          color={'white.DEFAULT'}
          onClick={addNewInputField}
        >
          {'+'}
        </Button>
      </Flex>
      <>
        {inputFieldsValue.map((d, i) => {
          return (
            <InputGroup key={`${d.eventName}-${i}`}>
              <Input
                type={'text'}
                fontSize={'xs-14'}
                lineHeight={'xs-14'}
                fontWeight={'medium'}
                textColor={'white.DEFAULT'}
                value={d.eventName}
                onChange={(e) => handleInputChangeValue(e, i)}
                bg={'rgba(255, 255, 255, 0.04)'}
                border={'0'}
                borderRadius={'200'}
                placeholder={'Add event'}
                _placeholder={{
                  fontSize: 'xs-14',
                  lineHeight: 'sh-18',
                  fontWeight: 400,
                  color: 'rgba(255, 255, 255, 0.2)',
                }}
              />
              <InputRightElement
                color={'white'}
                onClick={() => removeInputField(i)}
                cursor={'pointer'}
              >
                {'-'}
              </InputRightElement>
            </InputGroup>
          );
        })}
      </>
    </Flex>
  );
};

export default CreateFunnel;
