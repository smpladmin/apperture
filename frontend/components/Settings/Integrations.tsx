import {
  Box,
  Button,
  Divider,
  Flex,
  Highlight,
  IconButton,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import Image from 'next/image';
import 'remixicon/fonts/remixicon.css';
import slackIcon from '@assets/images/slackIcon.svg';
import tickIcon from '@assets/icons/tick-icon.svg';
import { useRouter } from 'next/router';
import { FRONTEND_BASE_URL, BACKEND_BASE_URL } from 'config';
import Link from 'next/link';
import { User } from '@lib/domain/user';
import ConfirmationModal from '@components/ConfirmationModal';
import { removeSlackCredentials } from '@lib/services/userService';
import Render from '@components/Render';

const IntegrationConnectionInfo = () => {
  return (
    <Flex alignItems={'center'} gap={'1'}>
      <Image src={tickIcon} alt={'tickIcon'} />
      <Text
        fontSize={'xs-12'}
        lineHeight={'xs-12'}
        fontWeight={'medium'}
        color={'green'}
      >
        Connected
      </Text>
    </Flex>
  );
};

const Integrations = ({ user }: { user: User }) => {
  const router = useRouter();
  const { previousDsId } = router.query;
  const SLACK_OAUTH_LINK = `${BACKEND_BASE_URL}/integrations/oauth/slack?redirect_url=${FRONTEND_BASE_URL}/analytics/settings/integrations?previousDsId=${previousDsId}`;
  const { isOpen, onOpen, onClose } = useDisclosure();

  const openConfirmationModal = () => {
    router.push({
      pathname: '/analytics/settings/integrations',
      query: { ...router.query, removeSlackCredentials: true },
    });
    onOpen();
  };

  const closeConfirmationModal = () => {
    delete router.query?.['removeSlackCredentials'];
    router.push({
      pathname: '/analytics/settings/integrations',
      query: { ...router.query },
    });
    onClose();
  };

  const handleDeleteSlackCredentials = async () => {
    await removeSlackCredentials();
    closeConfirmationModal();
  };

  return (
    <>
      <Flex>
        <Box w={{ base: 'full', md: '150' }} p={{ base: '0', md: '6 ' }}>
          <Box>
            <Flex
              p={{ base: '4', md: '0 ' }}
              w={'full'}
              justifyContent={{ base: 'flex-start', md: 'flex-end' }}
            >
              <IconButton
                aria-label="close"
                variant={'secondary'}
                icon={<i className="ri-arrow-left-line"></i>}
                rounded={'full'}
                bg={'white.DEFAULT'}
                border={'1px'}
                size={'sm'}
                borderColor={'white.200'}
                onClick={() =>
                  router.push(
                    `/analytics/settings?previousDsId=${previousDsId}`
                  )
                }
              />
            </Flex>
          </Box>
          <Box
            fontSize={{ base: 'sh-20', md: 'sh-44' }}
            fontWeight={'semibold'}
            lineHeight={{ base: 'sh-20', md: 'sh-44' }}
            pl={{ base: '4', md: '0' }}
          >
            Integrations
          </Box>
          <Render on="mobile">
            <Divider
              orientation="horizontal"
              borderColor={'white.200'}
              opacity={1}
              mt={'4'}
            />
          </Render>
          <Flex
            mt={{ md: '8' }}
            py={'6'}
            px={'4'}
            gap={'4'}
            justifyContent={'space-between'}
          >
            <Flex gap={'2'}>
              <Flex alignItems={'flex-start'} minW={'10'} minH={'10'}>
                <Image src={slackIcon} alt={'slackIntegration'} />
              </Flex>
              <Flex direction={'column'} gap={'2'}>
                <Flex gap={'2'} alignItems={'center'}>
                  <Text
                    fontSize={'base'}
                    lineHeight={'xs-14'}
                    fontWeight={'semibold'}
                  >
                    Slack
                  </Text>
                  {user?.slackChannel ? <IntegrationConnectionInfo /> : null}
                </Flex>
                <Text
                  fontSize={'xs-12'}
                  lineHeight={'xs-12'}
                  fontWeight={'normal'}
                  color={'grey.200'}
                >
                  {user?.slackChannel ? (
                    <Highlight
                      query={user?.slackChannel}
                      styles={{ fontWeight: 'semibold', color: 'grey.200' }}
                    >{`Sending notifications to ‘${user?.slackChannel}’`}</Highlight>
                  ) : (
                    'Connect your organisation’s slack to Apperture'
                  )}
                </Text>
              </Flex>
            </Flex>
            {user?.slackChannel ? (
              <Button
                h={'8'}
                borderRadius={'25'}
                px={'3'}
                py={'2'}
                bg={'white.100'}
                minW={'18'}
                onClick={openConfirmationModal}
              >
                <Text
                  fontSize={'xs-12'}
                  lineHeight={'xs-12'}
                  fontWeight={'medium'}
                >
                  Remove
                </Text>
              </Button>
            ) : (
              <Link href={SLACK_OAUTH_LINK}>
                <Button
                  h={'8'}
                  borderRadius={'25'}
                  px={'3'}
                  py={'2'}
                  bg={'black.100'}
                  minW={'18'}
                >
                  <Text
                    fontSize={'xs-12'}
                    lineHeight={'xs-12'}
                    fontWeight={'medium'}
                    color={'white.DEFAULT'}
                  >
                    {'Connect'}
                  </Text>
                </Button>
              </Link>
            )}
          </Flex>
          <Divider
            orientation="horizontal"
            borderColor={'white.200'}
            opacity={1}
          />
        </Box>
        <Render on="desktop">
          <Box flexGrow={'1'} bg={'#64646B'}></Box>
        </Render>
        <ConfirmationModal
          isOpen={isOpen}
          onClose={closeConfirmationModal}
          headerText={'Stop getting alerts on Slack?'}
          bodyText={'Are your sure you want to remove integration with Slack?'}
          primaryButtonText={'Remove'}
          primaryAction={handleDeleteSlackCredentials}
          secondaryAction={closeConfirmationModal}
        />
      </Flex>
    </>
  );
};

export default Integrations;
