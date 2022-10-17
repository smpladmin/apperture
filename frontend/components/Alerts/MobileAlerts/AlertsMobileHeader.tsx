import { Divider, Flex, IconButton, Text } from '@chakra-ui/react';

const AlertsHeader = ({
  closeAlertsSheet,
}: {
  closeAlertsSheet: () => void;
}) => {
  return (
    <>
      <Flex
        justifyContent={'space-between'}
        pt={'5'}
        px={'4'}
        pb={'4'}
        alignItems={'center'}
      >
        <Text fontSize={'sh-20'} lineHeight={'sh-20'} fontWeight={'semibold'}>
          Alert me
        </Text>
        <IconButton
          aria-label="close"
          variant={'primary'}
          icon={<i className="ri-close-fill" />}
          rounded={'full'}
          bg={'black.100'}
          color={'white.DEFAULT'}
          border={'1px'}
          borderColor={'white.200'}
          size={'sm'}
          onClick={closeAlertsSheet}
        />
      </Flex>
      <Divider orientation="horizontal" borderColor={'white.200'} opacity={1} />
    </>
  );
};
export default AlertsHeader;
