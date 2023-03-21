import {
  Button,
  Divider,
  Flex,
  IconButton,
  Input,
  Switch,
  Text,
} from '@chakra-ui/react';
import EventFields from '../components/EventFields';
import { BASTILLE } from '@theme/index';
import { FunnelStep } from '@lib/domain/funnel';

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
    <Flex direction={'column'} gap={'4'} mt={{ base: '6', md: '8' }}>
      <Flex justifyContent={'space-between'} alignItems={'center'}>
        <Text
          fontSize={{ base: 'sh-18', md: 'sh-24' }}
          lineHeight={{ base: 'sh-18', md: 'sh-24' }}
          fontWeight={{ base: '500', md: '400' }}
          color={'white.DEFAULT'}
        >
          Steps
        </Text>
        <Button
          data-testid={'add-button'}
          rounded={'full'}
          variant={'primary'}
          size={'md'}
          bg={'black.20'}
          color={'white.DEFAULT'}
          onClick={handleAddNewStep}
          fontSize={'sh-20'}
        >
          {'+'}
        </Button>
      </Flex>
      <EventFields funnelSteps={funnelSteps} setFunnelSteps={setFunnelSteps} />
      <Divider orientation="horizontal" borderColor={BASTILLE} opacity={1} />
      <Flex justifyContent={'space-between'} alignItems={'center'}>
        <Text
          fontSize={{ base: 'xs-14', md: 'base' }}
          lineHeight={{ base: 'xs-14', md: 'base' }}
          fontWeight={'normal'}
          color={'white.DEFAULT'}
        >
          In any sequence
        </Text>
        <Switch background={'black'} size={'sm'} isDisabled />
      </Flex>
    </Flex>
  );
};

export default CreateFunnelAction;
