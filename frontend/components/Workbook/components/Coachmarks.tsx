import {
  Box,
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';
import { BLACK_DEFAULT, GREY_400 } from '@theme/index';
import Image, { StaticImageData } from 'next/image';
import { Circle } from 'phosphor-react';
import Slide1 from '@assets/images/coachmark-1.svg';
import Slide2 from '@assets/images/coachmark-2.svg';
import Slide3 from '@assets/images/coachmark-3.svg';
import Slide4 from '@assets/images/coachmark-4.svg';
import CoachmarkArrow from '@assets/images/coachmark-arrow.svg';
import React, { useState } from 'react';
import { updateSheetsVisitedStatus } from '@lib/services/userService';

const Coachmarks = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const getSlideImage = (index: number) => {
    const imgSrc: { [key: number]: StaticImageData } = {
      0: Slide1,
      1: Slide2,
      2: Slide3,
      3: Slide4,
    };
    return <Image src={imgSrc[index]} alt={'coachmark'} priority />;
  };

  const getTextContent = (index: number) => {
    const text: {
      [key: number]: string;
    } = {
      0: 'Add columns from tables',
      1: 'Just ask the AI',
      2: 'SQL for the nerds!',
      3: 'Formulas for quick analysis',
    };
    return text[index];
  };

  const handleUpdateSheetVisitedStatus = async () => {
    await updateSheetsVisitedStatus();
    onClose();
  };

  const lastSlideIndex = 3;
  const isLastSlideActive = activeIndex === lastSlideIndex;
  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        closeOnOverlayClick={false}
        size={'4xl'}
        scrollBehavior="outside"
      >
        <ModalOverlay opacity={'0.8 !important'} bg={'black.DEFAULT'} />
        <ModalContent
          width={'175'}
          borderRadius={'12'}
          position={'absolute'}
          top={'100px'}
          left={'406px'}
          m={'0'}
        >
          <ModalBody p={'0'}>
            <Flex direction={'column'} position={'relative'}>
              <Box borderRadius={'12'} overflow={'hidden'}>
                {getSlideImage(activeIndex)}
              </Box>
              <Flex px={'10'} pt={'6'} pb={'8'} direction={'column'} gap={'6'}>
                <Text
                  fontSize={'sh-20'}
                  lineHeight={'sh-20'}
                  textAlign={'center'}
                  fontWeight={600}
                >
                  {getTextContent(activeIndex)}
                </Text>
                <Text
                  fontSize={'xs-14'}
                  lineHeight={'xs-14'}
                  textAlign={'center'}
                  fontWeight={400}
                  color={'grey.800'}
                  pb={'4'}
                >
                  Select a data connection, click on the table name and add
                  columns
                </Text>
                <Flex justifyContent={'center'} alignItems={'center'} gap={'2'}>
                  <Button
                    py={'3'}
                    px={'4'}
                    variant={'secondary'}
                    border={'1px'}
                    borderRadius={'8'}
                    fontSize={'xs-14'}
                    lineHeight={'xs-14'}
                    fontWeight={'500'}
                    bg={'transparent'}
                    onClick={() =>
                      setActiveIndex((prevIndex) => Math.max(prevIndex - 1, 0))
                    }
                  >
                    Back
                  </Button>
                  <Button
                    variant={'primary'}
                    py={'3'}
                    px={'4'}
                    border={'1px'}
                    borderRadius={'8'}
                    fontSize={'xs-14'}
                    lineHeight={'xs-14'}
                    fontWeight={'500'}
                    textColor="white.100"
                    bg="black.100"
                    onClick={() => {
                      isLastSlideActive
                        ? handleUpdateSheetVisitedStatus()
                        : setActiveIndex((prevIndex) =>
                            Math.min(prevIndex + 1, 3)
                          );
                    }}
                  >
                    {isLastSlideActive ? 'Done' : 'Next'}
                  </Button>
                </Flex>
                <Flex
                  justifyContent={'center'}
                  alignItems={'center'}
                  gap={'6px'}
                >
                  {Array.from({ length: 4 }).map((_, i) => {
                    return (
                      <Circle
                        key={i}
                        size={8}
                        weight="fill"
                        color={i === activeIndex ? BLACK_DEFAULT : GREY_400}
                        onClick={() => setActiveIndex(i)}
                        style={{ cursor: 'pointer' }}
                      />
                    );
                  })}
                </Flex>
              </Flex>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
      {isOpen ? (
        <>
          <Text
            position={'absolute'}
            zIndex={1500}
            top={'62px'}
            left={'672px'}
            color={'white.DEFAULT'}
            fontSize={'xs-16'}
            fontWeight={'500'}
            lineHeight={'xs-16'}
          >
            {'Let’s get you started!'}
          </Text>
          <Box position={'absolute'} zIndex={1500} top={'128px'} left={'332px'}>
            <Image src={CoachmarkArrow} />
          </Box>
          <Box
            position={'absolute'}
            zIndex={1500}
            top={'128px'}
            left={'1140px'}
          >
            <Image
              src={CoachmarkArrow}
              style={{ transform: 'rotate(-180deg)' }}
            />
          </Box>

          <Box position={'absolute'} zIndex={1500} top={'56px'} left={'352px'}>
            <Image
              height={'40'}
              src={CoachmarkArrow}
              style={{ transform: 'rotate(45deg)' }}
            />
          </Box>
          <Box position={'absolute'} zIndex={1500} top={'56px'} left={'1120px'}>
            <Image
              src={CoachmarkArrow}
              height={'40'}
              style={{ transform: 'rotate(135deg)' }}
            />
          </Box>

          <Box position={'absolute'} zIndex={1500} top={'36px'} left={'420px'}>
            <Image
              src={CoachmarkArrow}
              height={'40'}
              style={{ transform: 'rotate(80deg)' }}
            />
          </Box>
          <Box position={'absolute'} zIndex={1500} top={'36px'} left={'1052px'}>
            <Image
              src={CoachmarkArrow}
              height={'40'}
              style={{ transform: 'rotate(-260deg)' }}
            />
          </Box>
        </>
      ) : null}
    </>
  );
};

export default Coachmarks;
