import { Box, Button, Flex, Text } from '@chakra-ui/react';
import { AppertureUser } from '@lib/domain/user';
import { generateAPIKey } from '@lib/services/apiKeyService';
import { GREEN_500 } from '@theme/index';
import { CheckCircle, Copy } from 'phosphor-react';
import React, { useState } from 'react';

const APIKey = ({ user }: { user: AppertureUser }) => {
  const [apiKey, setApiKey] = useState(user?.apiKey || '');
  const [isCopied, setIsCopied] = useState(false);

  const handleGenerateAPIKey = async () => {
    const { status, data } = await generateAPIKey();
    if (status === 200) {
      setApiKey(data);
    }
  };

  const handleCopyClick = async () => {
    navigator.clipboard.writeText(apiKey);
    setIsCopied(true);

    // Reset the "copied" state after 3 seconds
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    <Flex
      direction={'column'}
      alignItems={'center'}
      justifyContent={'center'}
      gap={'4'}
      p={'4'}
    >
      {apiKey ? (
        <>
          <Text fontSize={'xs-16'} fontWeight={'500'} lineHeight={'xs-16'}>
            Your API Key
          </Text>
          <Flex alignItems={'center'} gap={'2'}>
            <Box
              p={'2'}
              color={'grey.900'}
              fontSize={'xs-14'}
              lineHeight={'xs-14'}
              fontWeight={'400'}
              border={'1px dashed black'}
              borderRadius={'4'}
            >
              {apiKey}
            </Box>
            {isCopied ? (
              <CheckCircle size={24} weight="fill" color={GREEN_500} />
            ) : (
              <Copy
                size={24}
                weight="fill"
                cursor={'pointer'}
                onClick={handleCopyClick}
              />
            )}
          </Flex>
        </>
      ) : (
        <Button
          onClick={handleGenerateAPIKey}
          variant={'primary'}
          bg={'black'}
          color={'white.DEFAULT'}
        >
          Generate API Key
        </Button>
      )}
    </Flex>
  );
};

export default APIKey;
