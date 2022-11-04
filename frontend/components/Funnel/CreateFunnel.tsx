import {
  Box,
  Button,
  Divider,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Text,
  Switch,
} from '@chakra-ui/react';
import 'remixicon/fonts/remixicon.css';
import Image from 'next/image';
import React, { ChangeEvent, Fragment, useEffect, useState } from 'react';
import HorizontalParallelLineIcon from '@assets/icons/horizontal-parallel-line.svg';
import CrossIcon from '@assets/icons/cross-icon.svg';
import FunnelIcon from '@assets/icons/funnel-icon.svg';

const CreateFunnel = () => {
  const [inputFieldsValue, setInputFieldsValue] = useState([
    { eventName: '' },
    { eventName: '' },
  ]);
  const [showCrossIcon, setShowCrossIcon] = useState(false);

  useEffect(() => {
    if (inputFieldsValue.length <= 2) return;
    setShowCrossIcon(true);
  }, [inputFieldsValue.length]);

  const addNewInputField = () => {
    const newField = { eventName: '' };
    setInputFieldsValue([...inputFieldsValue, newField]);
  };

  const removeInputField = (index: number) => {
    if (inputFieldsValue.length === 2) return;
    let deletedInputValues = [...inputFieldsValue];
    deletedInputValues.splice(index, 1);
    setInputFieldsValue(deletedInputValues);
  };

  const handleInputChangeValue = (
    e: ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const inputValues = [...inputFieldsValue];
    inputValues[index].eventName = e.target.value;
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
      <Flex direction={'column'} gap={'4'}>
        {inputFieldsValue.map((inputValue, i) => {
          return (
            <Box key={i} draggable>
              <InputGroup>
                <InputLeftElement cursor={'all-scroll'}>
                  <Image
                    src={HorizontalParallelLineIcon}
                    alt={'parallel-line-icon'}
                  />
                </InputLeftElement>
                <Input
                  type={'text'}
                  fontSize={'xs-14'}
                  lineHeight={'xs-14'}
                  fontWeight={'medium'}
                  textColor={'white.DEFAULT'}
                  height={'12'}
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
                  value={inputValue?.eventName}
                  onChange={(e) => handleInputChangeValue(e, i)}
                />
                <InputRightElement
                  color={'white'}
                  cursor={'pointer'}
                  pr={'4'}
                  alignItems={'center'}
                >
                  {showCrossIcon ? (
                    <Image
                      src={CrossIcon}
                      onClick={() => removeInputField(i)}
                      alt={'cross-icon'}
                    />
                  ) : null}
                </InputRightElement>
              </InputGroup>
            </Box>
          );
        })}
      </Flex>
      <Divider
        mt={'4'}
        orientation="horizontal"
        borderColor={'#282836'}
        opacity={1}
      />
      <Flex justifyContent={'space-between'} alignItems={'center'}>
        <Text
          fontSize={'base'}
          lineHeight={'base'}
          fontWeight={'normal'}
          color={'white.DEFAULT'}
        >
          Steps in any order
        </Text>
        <Switch background={'black'} colorScheme={'blackAlpha'} size={'sm'} />
      </Flex>
    </Flex>
  );
};

export default CreateFunnel;
