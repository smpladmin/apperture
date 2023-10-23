import { Avatar, Box, Flex, Text } from '@chakra-ui/react';
import React from 'react';
import { MessageType } from '../../../lib/types';
import { getFormattedTimeIn12HourFormat } from '../../../lib/util';

export const APPERTURE = 'apperture';

type ChatTemplateProps = {
  children: React.ReactNode;
  sender: string;
  timestamp: string;
  messageType?: string;
};

const ChatTemplate = ({
  children,
  sender,
  timestamp,
  messageType,
}: ChatTemplateProps) => {
  const appertureIcon = 'https://cdn.apperture.io/apperture-new.svg';

  const isUserApperture = sender === APPERTURE;
  const senderName = isUserApperture ? 'Apperture' : sender;

  const time = getFormattedTimeIn12HourFormat(new Date(timestamp));

  return (
    <Box>
      <Flex alignItems={'center'} gap={'4px'}>
        <Avatar
          name={senderName}
          src={isUserApperture ? appertureIcon : ''}
          size={'2xs'}
          rounded={'full'}
        />
        <Text fontSize={'12px'} fontWeight={'700'} lineHeight={'16px'}>
          {senderName}
        </Text>
        <Text fontSize={'10px'} fontWeight={'400'} lineHeight={'13px'}>
          {timestamp ? time : ''}
        </Text>
      </Flex>
      <Box
        border={'0.4px solid #BDBDBD'}
        borderRadius={'6'}
        py={'12px'}
        px={'12px'}
        mt={'8px'}
        bg={messageType === MessageType.NLP_TEXT ? '#f5f5f5' : ''}
      >
        {children}
      </Box>
    </Box>
  );
};

export default ChatTemplate;
