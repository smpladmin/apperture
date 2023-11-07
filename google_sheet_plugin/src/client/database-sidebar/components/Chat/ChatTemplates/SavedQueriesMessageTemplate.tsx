import React from 'react';
import ChatTemplate from './ChatTemplate';
import { Button, Flex, Highlight, Text } from '@chakra-ui/react';
import { Message, MessageType, WorkbookWithSheet } from '../../../lib/types';

type SavedQueriesMessageTemplateProps = {
  flattenWorkbooks?: WorkbookWithSheet[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  onQueryClick: (workbook: WorkbookWithSheet) => Promise<void>;
  timestamp: string;
};

const SavedQueriesMessageTemplate = ({
  flattenWorkbooks,
  setMessages,
  onQueryClick,
  timestamp,
}: SavedQueriesMessageTemplateProps) => {
  return (
    <ChatTemplate sender="apperture" timestamp={''}>
      <Flex direction={'column'} gap={'20px'}>
        <Text fontSize={'12px'} fontWeight={'400'} lineHeight={'16px'}>
          Hey👋 You can start by either selecting a saved query or typing a new
          query
        </Text>

        <Flex direction={'column'} gap={'4px'}>
          {flattenWorkbooks.slice(0, 3).map((workbook, index) => {
            return (
              <Flex
                border={'0.4px solid #BDBDBD'}
                borderRadius={'6'}
                py={'8px'}
                px={'8px'}
                fontSize={'10px'}
                fontWeight={'500'}
                lineHeight={'14px'}
                key={index}
                cursor={'pointer'}
                _hover={{
                  bg: '#F5F5F5',
                }}
                onClick={() => onQueryClick(workbook)}
              >
                <Text>
                  <Highlight
                    query={`•${workbook.sheet.name}`}
                    styles={{
                      color: '#606060',
                      fontWeight: '400',
                    }}
                  >
                    {`${workbook.name}•${workbook.sheet.name}`}
                  </Highlight>
                </Text>
              </Flex>
            );
          })}
          {flattenWorkbooks.length > 3 && (
            <Button
              bg={'#212121'}
              px={'8px'}
              py={'6px'}
              border={'0'}
              borderRadius={'8'}
              fontSize={'12px'}
              fontWeight={'500'}
              lineHeight={'16px'}
              color={'#fff'}
              textAlign={'center'}
              _hover={{
                bg: '#212121',
              }}
              onClick={() => {
                setMessages((prevMsg) => {
                  return [
                    ...prevMsg,
                    {
                      sender: 'apperture',
                      text: 'View Queries',
                      type: MessageType.VIEW_QUERIES,
                      timestamp: new Date().toString(),
                    },
                  ];
                });
              }}
            >
              View all queries
            </Button>
          )}
        </Flex>

        <Text fontSize={'12px'} fontWeight={'400'} lineHeight={'16px'}>
          <Highlight
            query={'View queries'}
            styles={{
              bg: '#E5F2FC',
              px: '6px',
              py: '2px',
              borderRadius: '4px',
            }}
          >
            {'You can always type View queries to view saved queries'}
          </Highlight>
        </Text>
      </Flex>
    </ChatTemplate>
  );
};

export default SavedQueriesMessageTemplate;
