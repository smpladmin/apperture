import { Box, Button, Divider, Flex, IconButton, Text } from '@chakra-ui/react';
import Image from 'next/image';
import 'remixicon/fonts/remixicon.css';
import slackIcon from '@assets/images/slackIcon.svg';
import { useRouter } from 'next/router';

const Integrations = () => {
  const router = useRouter();

  return (
    <Box py={'3'}>
      <Box pt={'4'} pl={'4'} mb={'4'}>
        <IconButton
          aria-label="close"
          variant={'secondary'}
          icon={<i className="ri-arrow-left-line"></i>}
          rounded={'full'}
          bg={'white.DEFAULT'}
          border={'1px'}
          size={'sm'}
          borderColor={'white.200'}
          onClick={() => router.push('/analytics/settings')}
        />
      </Box>

      <Box
        fontSize={'sh-20'}
        fontWeight={'semibold'}
        lineHeight={'sh-20'}
        ml={'4'}
      >
        Integrations
      </Box>
      <Divider
        orientation="horizontal"
        borderColor={'white.200'}
        opacity={1}
        mt={'4'}
      />
      <Flex py={'6'} px={'4'} gap={'4'} justifyContent={'space-between'}>
        <Flex gap={'2'}>
          <Flex alignItems={'flex-start'}>
            <Image src={slackIcon} alt={'slackIntegration'} />
          </Flex>
          <Flex direction={'column'} gap={'2'}>
            <Text
              fontSize={'xs-14'}
              lineHeight={'xs-14'}
              fontWeight={'semibold'}
            >
              Slack
            </Text>
            <Text
              fontSize={'xs-12'}
              lineHeight={'xs-12'}
              fontWeight={'normal'}
              color={'grey.200'}
            >
              {'Connect your organisation’s slack to Apperture'}
            </Text>
          </Flex>
        </Flex>
        <Button h={'8'} borderRadius={'25'} px={'3'} py={'2'} bg={'black.100'}>
          <Text
            fontSize={'xs-12'}
            lineHeight={'xs-12'}
            fontWeight={'medium'}
            color={'white.DEFAULT'}
          >
            Connect
          </Text>
        </Button>
        {/* <Button h={'8'} borderRadius={'25'} px={'3'} py={'2'} bg={'white.100'}>
          <Text fontSize={'xs-12'} lineHeight={'xs-12'} fontWeight={'medium'}>
            Remove
          </Text>
        </Button> */}
      </Flex>
      <Divider orientation="horizontal" borderColor={'white.200'} opacity={1} />
    </Box>
  );
};

export default Integrations;
