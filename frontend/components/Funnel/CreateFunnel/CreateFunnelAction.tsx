import {
  Box,
  Button,
  Divider,
  Flex,
  Icon,
  Switch,
  Text,
} from '@chakra-ui/react';
import EventFields from '../components/EventFields';
import { BASTILLE } from '@theme/index';
import { FunnelStep } from '@lib/domain/funnel';
import { CaretDown, Plus } from '@phosphor-icons/react';

type CreateFunnelActionProps = {
  funnelSteps: FunnelStep[];
  setFunnelSteps: Function;
  setIsStepAdded: Function;
};

const CreateFunnelAction = ({
  funnelSteps,
  setFunnelSteps,
  setIsStepAdded,
}: CreateFunnelActionProps) => {
  const handleAddNewStep = () => {
    const newField = { event: '', filters: [] };
    setFunnelSteps([...funnelSteps, newField]);
    setIsStepAdded(true);
  };

  return (
    <Flex direction={'column'} gap={'3'} w={'full'}>
      <Flex px={2} justifyContent={'space-between'} alignItems={'center'}>
        <Flex gap={2} alignItems={'center'}>
          <Text
            fontSize={'xs-12'}
            lineHeight={'xs-12'}
            fontWeight={'400'}
            color={'grey.500'}
          >
            Steps (any sequence)
          </Text>
          <CaretDown size={14} color={'#747474'} />
        </Flex>
        <Button
          h={5.5}
          minW={5.5}
          w={5.5}
          p={0}
          data-testid={'add-button'}
          onClick={handleAddNewStep}
          cursor={'pointer'}
          variant={'secondary'}
        >
          <Plus size={14} color={'#000000'} weight={'bold'} />
        </Button>
      </Flex>
      <EventFields funnelSteps={funnelSteps} setFunnelSteps={setFunnelSteps} />
      {/* <Flex justifyContent={'space-between'} alignItems={'center'}>
        <Text
          fontSize={{ base: 'xs-14', md: 'base' }}
          lineHeight={{ base: 'xs-14', md: 'base' }}
          fontWeight={'normal'}
          color={'white.DEFAULT'}
        >
          In any sequence
        </Text>
        <Switch background={'black'} size={'sm'} isDisabled />
      </Flex> */}
      <Box mt={6}>
        <Flex gap={2} alignItems={'center'}>
          <Text
            fontSize={'xs-12'}
            lineHeight={'xs-12'}
            fontWeight={'400'}
            color={'grey.500'}
          >
            Steps (any sequence)
          </Text>
          <CaretDown size={14} color={'#747474'} />
        </Flex>
        <Flex px={2} justifyContent={'space-between'} alignItems={'center'}>
          <Flex gap={2} alignItems={'center'}>
            <Text
              fontSize={'xs-12'}
              lineHeight={'xs-12'}
              fontWeight={'400'}
              color={'grey.500'}
            >
              Conversion Time
            </Text>
          </Flex>
          <Button
            h={5.5}
            minW={5.5}
            w={5.5}
            p={0}
            data-testid={'add-button'}
            onClick={handleAddNewStep}
            cursor={'pointer'}
            variant={'secondary'}
          >
            <Plus size={14} color={'#000000'} weight={'bold'} />
          </Button>
        </Flex>
      </Box>
    </Flex>
  );
};

export default CreateFunnelAction;
