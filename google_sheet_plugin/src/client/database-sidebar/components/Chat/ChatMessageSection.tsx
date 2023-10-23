import { Flex } from '@chakra-ui/react';
import React, { useEffect, useMemo, useRef } from 'react';
import SavedQueriesMessageTemplate from './ChatTemplates/SavedQueriesMessageTemplate';
import AllQueriesMessageTemplate from './ChatTemplates/AllQueriesMessageTemplate';
import {
  ActiveCell,
  Message,
  MessageType,
  Workbook,
  WorkbookWithSheet,
} from '../../lib/types';
import ChatTemplate from './ChatTemplates/ChatTemplate';
import { flattenWorkbooksWithSheets } from '../../lib/util';
import { serverFunctions } from '../../../utils/serverFunctions';
import SelectedQueryTemplate from './ChatTemplates/SelectedQueryTemplate';
import { ThreeDots } from 'react-loader-spinner';

type ChatMessageSectionProps = {
  isSql: boolean;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  workbooks: Workbook[];
  setCode: React.Dispatch<React.SetStateAction<string>>;
  activeCell: ActiveCell;
  updateResultRange: Function;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const ChatMessageSection = ({
  isSql,
  messages,
  setMessages,
  workbooks,
  setCode,
  activeCell,
  updateResultRange,
  isLoading,
  setIsLoading,
}: ChatMessageSectionProps) => {
  const flattenWorkbookWithSheets = flattenWorkbooksWithSheets(workbooks);
  const apiKey = useMemo(() => {
    return localStorage.getItem('apiKey') || '';
  }, []);

  const onQueryClick = async (workbook: WorkbookWithSheet) => {
    setMessages((prevMsg) => {
      return [
        ...prevMsg,
        {
          sender: 'apperture',
          type: MessageType.SELECTED_QUERY,
          text: '',
          timestamp: new Date().toString(),
          selectedWorkbook: workbook,
        },
      ];
    });
    setCode(workbook.sheet.query);
    setIsLoading(true);

    const response = await serverFunctions.executeQuery(
      apiKey,
      workbook.sheet.query,
      true,
      null,
      activeCell
    );
    setIsLoading(false);

    updateResultRange(
      response?.data?.length || 0,
      response?.headers?.length || 0
    );
  };

  const chatContainerRef = useRef(null);

  useEffect(() => {
    // scroll to last child whenever new message is added
    if (chatContainerRef.current) {
      const lastChild = chatContainerRef.current.lastChild;
      lastChild && lastChild.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  return (
    <Flex
      direction={'column'}
      gap={'20px'}
      minHeight={isSql ? '260px' : '360px'}
      maxHeight={isSql ? '260px' : '360px'}
      overflow={'auto'}
      ref={chatContainerRef}
    >
      <SavedQueriesMessageTemplate
        flattenWorkbooks={flattenWorkbookWithSheets}
        setMessages={setMessages}
        onQueryClick={onQueryClick}
        timestamp={new Date().toString()}
      />
      {messages.map((message, index) => {
        if (message.type === MessageType.VIEW_QUERIES) {
          return (
            <AllQueriesMessageTemplate
              flattenWorkbooks={flattenWorkbookWithSheets}
              onQueryClick={onQueryClick}
              key={index}
              timestamp={message.timestamp}
            />
          );
        }
        if (message.type === MessageType.SELECTED_QUERY) {
          return (
            <SelectedQueryTemplate
              workbook={message?.selectedWorkbook}
              timestamp={message.timestamp}
              key={index}
            />
          );
        }
        return (
          <ChatTemplate
            sender={message.sender}
            timestamp={message.timestamp}
            key={index}
            messageType={message.type}
          >
            {
              <Flex fontSize={'12px'} fontWeight={'400'} lineHeight={'16px'}>
                {message.text}
              </Flex>
            }
          </ChatTemplate>
        );
      })}
      {isLoading && (
        <Flex justifyContent={'center'}>
          <ThreeDots
            height="20"
            width="20"
            radius="8"
            color="#d5d5d5"
            ariaLabel="three-dots-loading"
            visible={true}
          />
        </Flex>
      )}
    </Flex>
  );
};

export default ChatMessageSection;
