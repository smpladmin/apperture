import {
  Button,
  Editable,
  EditableInput,
  EditablePreview,
  Flex,
  IconButton,
  Text,
} from '@chakra-ui/react';
import React from 'react';
import { ArrowLeft } from '@phosphor-icons/react';

type EventLayoutHeaderProps = {
  handleGoBack: Function;
  name: string;
  setName: Function;
  handleSave: Function;
  isSaveButtonDisabled: boolean;
};

const EventLayoutHeader = ({
  handleGoBack,
  name,
  setName,
  handleSave,
  isSaveButtonDisabled,
}: EventLayoutHeaderProps) => {
  return (
    <Flex
      py={'3'}
      justifyContent={'space-between'}
      alignItems={'center'}
      borderBottom={'1px'}
      borderColor={'grey.DEFAULT'}
    >
      <Flex gap={'2'}>
        <IconButton
          aria-label="close"
          size={'sm'}
          icon={<ArrowLeft />}
          rounded={'full'}
          border={'1px'}
          borderColor={'grey.400'}
          bg={'white.DEFAULT'}
          onClick={() => handleGoBack()}
        />
        <Editable
          onChange={(nextValue) => setName(nextValue)}
          defaultValue={name}
          fontSize={'sh-18'}
          lineHeight={'sh-18'}
          fontWeight={'600'}
          color={'black.DEFAULT'}
        >
          <EditablePreview cursor={'pointer'} />
          <EditableInput
            borderBottom={'1px'}
            borderColor={'grey.400'}
            borderRadius={'0'}
          />
        </Editable>
      </Flex>
      <Button
        py={'2'}
        px={'4'}
        bg={'black.400'}
        borderRadius={'200'}
        variant={'primary'}
        onClick={() => handleSave()}
        data-testid={'save'}
        disabled={isSaveButtonDisabled}
      >
        <Text
          fontSize={'xs-14'}
          lineHeight={'120%'}
          fontWeight={'500'}
          color={'white.DEFAULT'}
        >
          Save
        </Text>
      </Button>
    </Flex>
  );
};

export default EventLayoutHeader;
