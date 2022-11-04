import { Button, Divider, Flex, Text, Switch } from '@chakra-ui/react';
import { ChangeEvent, useCallback, useState } from 'react';
import EventFields from './components/EventFields';

const CreateFunnel = () => {
  const [inputFieldsValue, setInputFieldsValue] = useState([
    { eventName: '' },
    { eventName: '' },
  ]);

  const addNewInputField = () => {
    const newField = { eventName: '' };
    setInputFieldsValue([...inputFieldsValue, newField]);
  };

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
      <EventFields
        eventFieldsValue={inputFieldsValue}
        setEventFieldsValue={setInputFieldsValue}
      />
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
