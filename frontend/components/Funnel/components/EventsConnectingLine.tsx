import { Flex } from '@chakra-ui/react';
import Image from 'next/image';
import dot from '@assets/icons/dot.svg';
import line from '@assets/icons/line.svg';

const EventsConnectingLine = ({ eventsLength }: { eventsLength: number }) => {
  return (
    <Flex direction={'column'} alignItems={'center'} py={'5'} gap={'1'}>
      <Image src={dot} alt={'dot'} />

      {Array.from({ length: eventsLength - 1 }).map((_, i) => {
        return (
          <Flex key={i} direction={'column'} alignItems={'center'} gap={'1'}>
            <Image src={line} alt={'vertical-line'} />
            <Image src={dot} alt={'dot'} />
          </Flex>
        );
      })}
    </Flex>
  );
};

export default EventsConnectingLine;
