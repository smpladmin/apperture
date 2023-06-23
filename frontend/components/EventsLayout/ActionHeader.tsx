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
import { ArrowLeft } from 'phosphor-react';

type EventLayoutHeaderProps = {
  handleGoBack: Function;
  name: string;
  setName: Function;
  handleSave: Function;
  isSaveButtonDisabled: boolean;
  isRunButtonPresent?: boolean;
  handleRunButtonClick?: Function;
  isSaved?: boolean;
};

const EventLayoutHeader = ({
  handleGoBack,
  name,
  setName,
  handleSave,
  isSaveButtonDisabled,
  isRunButtonPresent = false,
  isSaved = false,
  handleRunButtonClick = () => {},
}: EventLayoutHeaderProps) => {
  return (
    <Flex
      position={'sticky'}
      top={'0'}
      width={'full'}
      background={'white.400'}
      py={'3'}
      justifyContent={'space-between'}
      alignItems={'center'}
      borderBottom={'1px'}
      borderColor={'grey.DEFAULT'}
      zIndex={'99'}
    >
      <Flex gap={'2'}>
        <IconButton
          aria-label="back"
          size={'sm'}
          icon={<ArrowLeft />}
          rounded={'full'}
          border={'1px'}
          borderColor={'grey.400'}
          bg={'white.DEFAULT'}
          _hover={{
            bg: 'white.400',
          }}
          onClick={() => handleGoBack()}
          data-testid={'back-button'}
          marginLeft={isRunButtonPresent ? 4 : 0}
        />
        <Editable
          onChange={(nextValue) => setName(nextValue)}
          defaultValue={name}
          fontSize={'xs-16'}
          lineHeight={'xs-16'}
          fontWeight={'700'}
          color={'black.DEFAULT'}
        >
          <EditablePreview
            cursor={'pointer'}
            p={'2'}
            _hover={{ bg: 'white.200' }}
            borderRadius={'12'}
          />
          <EditableInput
            border={'1px'}
            borderColor={'grey.400'}
            borderRadius={'12'}
            bg={'white.DEFAULT'}
            p={'2'}
            data-testid={'entity-name'}
          />
        </Editable>
      </Flex>
      <Flex>
        {isRunButtonPresent ? (
          <Button
            py={'2'}
            px={'4'}
            bg={'black.400'}
            borderRadius={'200'}
            variant={'primary'}
            onClick={() => handleRunButtonClick()}
            disabled={false}
            marginRight={4}
          >
            <Text
              fontSize={'xs-14'}
              lineHeight={'120%'}
              fontWeight={'500'}
              color={'white.DEFAULT'}
            >
              Run
            </Text>
          </Button>
        ) : (
          <></>
        )}
        <Button
          py={'2'}
          px={'4'}
          bg={'black.400'}
          borderRadius={'200'}
          variant={'primary'}
          onClick={() => handleSave()}
          data-testid={'save'}
          disabled={isSaveButtonDisabled}
          marginRight={4}
        >
          <Text
            fontSize={'xs-14'}
            lineHeight={'120%'}
            fontWeight={'500'}
            color={'white.DEFAULT'}
          >
            {isSaved ? 'Update' : 'Save'}
          </Text>
        </Button>
      </Flex>
    </Flex>
  );
};

export default EventLayoutHeader;
