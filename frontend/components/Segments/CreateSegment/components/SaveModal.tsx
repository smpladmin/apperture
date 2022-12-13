import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Divider,
  Flex,
  Input,
  Textarea,
  Highlight,
} from '@chakra-ui/react';
import { SegmentGroup } from '@lib/domain/segment';
import { User } from '@lib/domain/user';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { convertISODateToReadableDate } from '@lib/utils/common';
import { saveSegment } from '@lib/services/segmentService';

type SaveSegmentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  groups: SegmentGroup[];
  columns: string[];
  user?: User;
};

const SaveSegmentModal = ({
  isOpen,
  onClose,
  groups,
  columns,
  user,
}: SaveSegmentModalProps) => {
  const [segmentName, setSegmentName] = useState('');
  const [segmentDesciption, setSegmentDescription] = useState('');
  const router = useRouter();
  const { dsId } = router.query;

  const currentDateAndTime = convertISODateToReadableDate(
    new Date().toISOString(),
    true
  );

  const handleSave = async () => {
    const response = await saveSegment(
      segmentName,
      segmentDesciption,
      dsId as string,
      groups,
      columns
    );
    if (response.status === 200) {
      const { _id, datasourceId } = response.data;
      router.push({
        pathname: '/segments/edit/[segmentId]',
        query: { segmentId: _id, dsId: datasourceId },
      });
    }
    onClose();
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
            Save User Segment
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
                query={'*'}
                styles={{
                  color: 'red',
                }}
              >
                Segment Name*
              </Highlight>
            </Text>
            <Input
              autoFocus
              type={'text'}
              size={'lg'}
              p={'3'}
              focusBorderColor={'black.100'}
              borderRadius={'8'}
              onChange={(e) => setSegmentName(e.target.value)}
            />
          </Flex>
          <Flex direction={'column'} mt={'8'} gap={'3'}>
            <Text
              fontSize={'xs-14'}
              lineHeight={'xs-14'}
              fontWeight={'400'}
              color={'grey.200'}
            >
              Add a Description (Optional)
            </Text>
            <Textarea
              bg={'white.100'}
              maxLength={120}
              focusBorderColor={'black.100'}
              resize={'none'}
              onChange={(e) => setSegmentDescription(e.target.value)}
            />
            <Text
              textAlign={'right'}
              fontSize={'xs-12'}
              lineHeight={'xs-12'}
              fontWeight={'400'}
              color={'grey.200'}
            >{`${segmentDesciption.length}/120`}</Text>
          </Flex>
        </ModalBody>
        <Divider
          orientation="horizontal"
          borderColor={'white.200'}
          opacity={1}
        />
        <ModalFooter pt={'5'} px={'9'} pb={'9'} display={'block'}>
          <Flex direction={'column'} gap={'5'}>
            <Flex alignItems={'center'} justifyContent={'space-between'}>
              <Text
                fontSize={'xs-14'}
                lineHeight={'xs-14'}
                fontWeight={'400'}
                color={'grey.200'}
              >
                {`Created by: ${user?.firstName} ${user?.lastName}`}
              </Text>
              <Text
                fontSize={'xs-14'}
                lineHeight={'xs-14'}
                fontWeight={'400'}
                color={'grey.200'}
              >
                {`Date: ${currentDateAndTime}`}
              </Text>
            </Flex>
            <Button
              width={'full'}
              variant={'primary'}
              padding={'4'}
              fontSize={'base'}
              lineHeight={'base'}
              fontWeight={'600'}
              height={'auto'}
              bg={'black.100'}
              color={'white.DEFAULT'}
              disabled={!segmentName}
              onClick={handleSave}
            >
              Save
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SaveSegmentModal;
