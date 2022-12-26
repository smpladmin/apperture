import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  Divider,
  Flex,
  Highlight,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';

const ExitConfirmationModal = ({
  isOpen,
  onClose,
  openSaveSegmentModal,
}: any) => {
  const router = useRouter();

  const handleSaveAsNewSegment = () => {
    onClose();
    openSaveSegmentModal();
  };

  const handleSave = () => {
    onClose();
  };

  const discard = () => {
    router.push({
      pathname: '/analytics/saved',
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      blockScrollOnMount={false}
      size={'2xl'}
      trapFocus={false}
    >
      <ModalOverlay backdropFilter={'blur(20px)'} bg={'grey.0'} />
      <ModalContent
        margin={'1rem'}
        maxWidth="168"
        maxHeight={'calc(100% - 100px)'}
        borderRadius={{ base: '16px', md: '20px' }}
      >
        <ModalHeader
          display={'flex'}
          justifyContent={'space-between'}
          alignItems={'center'}
          pt={'9'}
          px={'9'}
          pb={'6'}
        >
          <Text fontSize={'sh-24'} lineHeight={'sh-24'} fontWeight={'600'}>
            Unsaved Changes
          </Text>
          <ModalCloseButton
            position={'relative'}
            top={0}
            right={0}
            border={'1px'}
            borderColor={'white.200'}
            rounded={'full'}
            fontSize={'0.55rem'}
          />
        </ModalHeader>
        <Divider
          orientation="horizontal"
          borderColor={'white.200'}
          opacity={1}
        />

        <ModalBody px={'9'} overflowY={'auto'} py={'9'}>
          <Flex direction={'column'} gap={'3'}>
            <Text
              fontSize={'xs-14'}
              lineHeight={'xs-14'}
              fontWeight={'400'}
              color={'grey.200'}
            >
              <Highlight
                query={'Save before you go!'}
                styles={{
                  color: 'black',
                }}
              >
                Leaving would discard all the unsaved changes. Save before you
                go!
              </Highlight>
            </Text>
          </Flex>
          <Flex mt={'8'} gap={'3'} justifyContent={'space-between'}>
            <Flex alignContent={'flex-start'} width={'full'}>
              <Button
                width={'max-content'}
                variant={'secondary'}
                padding={'2'}
                fontSize={'xs-16'}
                lineHeight={'base'}
                fontWeight={'600'}
                height={'auto'}
                color={'red.DEFAULT'}
                onClick={discard}
              >
                Discard Changes
              </Button>
            </Flex>
            <Flex gap={'1'}>
              <Button
                width={'max-content'}
                variant={'secondary'}
                padding={'4'}
                fontSize={'xs-16'}
                lineHeight={'xs-22'}
                fontWeight={'600'}
                height={'auto'}
                color={'black.100'}
                border={'1px solid black'}
                onClick={handleSaveAsNewSegment}
              >
                Save as new segment
              </Button>
              <Button
                width={'max-content'}
                variant={'primary'}
                padding={'2'}
                fontSize={'xs-16'}
                lineHeight={'xs-22'}
                fontWeight={'600'}
                height={'auto'}
                bg={'black.100'}
                color={'white.DEFAULT'}
                onClick={handleSave}
              >
                Save changes
              </Button>
            </Flex>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ExitConfirmationModal;
