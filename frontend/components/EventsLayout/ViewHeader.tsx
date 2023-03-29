import { Button, Flex, IconButton, Text } from '@chakra-ui/react';
import ActionMenu from '@components/ActionMenu';
import { ArrowLeft } from 'phosphor-react';
import React from 'react';

type ViewHeaderProps = {
  handleGoBack: Function;
  name: string;
  handleEditClick: Function;
  handleNotificationClick: Function;
  disableAlert?: boolean;
};

const ViewHeader = ({
  handleGoBack,
  name,
  handleEditClick,
  handleNotificationClick,
  disableAlert,
}: ViewHeaderProps) => {
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
          onClick={() => handleGoBack?.()}
        />
        <Text
          p={'2'}
          fontSize={'xs-16'}
          lineHeight={'xs-16'}
          fontWeight={'700'}
          color={'black.DEFAULT'}
          data-testid={'entity-name'}
        >
          {name}
        </Text>
      </Flex>
      <Flex alignItems={'center'} gap={'6'}>
        <ActionMenu
          onNotificationClick={handleNotificationClick}
          disableAlert={disableAlert}
        />
        <Button
          py={'2'}
          px={'4'}
          bg={'black.400'}
          borderRadius={'200'}
          variant={'primary'}
          onClick={() => handleEditClick?.()}
          data-testid={'edit'}
        >
          <Text
            fontSize={'xs-14'}
            lineHeight={'120%'}
            fontWeight={'500'}
            color={'white.DEFAULT'}
          >
            Edit
          </Text>
        </Button>
      </Flex>
    </Flex>
  );
};

export default ViewHeader;
