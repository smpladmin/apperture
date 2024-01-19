import { Box, Button, Flex, Text } from '@chakra-ui/react';
import { App } from '@lib/domain/app';
import { generateAPIKey } from '@lib/services/apiKeyService';
import { GREEN_500 } from '@theme/index';
import { useRouter } from 'next/router';
import { CheckCircle, Copy } from 'phosphor-react';
import React, { useState } from 'react';

const APIKey = ({ app }: { app: App }) => {
  const [apiKey, setApiKey] = useState(app?.apiKey || '');
  const [isCopied, setIsCopied] = useState(false);
  const router = useRouter();
  const { appId } = router.query;

  const handleGenerateAPIKey = async () => {
    const { status, data } = await generateAPIKey(appId as string);
    if (status === 200) {
      setApiKey(data);
    }
  };

  const handleCopyClick = async () => {
    navigator.clipboard.writeText(apiKey);
    setIsCopied(true);

    // Reset the "copied" state after 2 seconds
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
            {`${app.name}'s API Key:`} 
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
                data-testid={'copy-button'}
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
