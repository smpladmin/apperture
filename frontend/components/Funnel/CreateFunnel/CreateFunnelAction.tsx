import { Button, Flex, Text } from '@chakra-ui/react';
import EventFields from '../components/EventFields';
import { ConversionWindowObj, FunnelStep } from '@lib/domain/funnel';
import { CaretDown, Plus } from '@phosphor-icons/react';
import ConversionCriteria from '../components/ConversionCriteria';

type CreateFunnelActionProps = {
  funnelSteps: FunnelStep[];
  setFunnelSteps: Function;
  setIsStepAdded: Function;
  conversionWindow: ConversionWindowObj;
  setConversionWindow: Function;
};

const CreateFunnelAction = ({
  funnelSteps,
  setFunnelSteps,
  setIsStepAdded,
  conversionWindow,
  setConversionWindow,
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
            color={'grey.500'}
            fontSize={{ base: 'xs-10', md: 'xs-12' }}
            lineHeight={{ base: 'xs-10', md: 'xs-12' }}
            fontWeight={'400'}
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
      <ConversionCriteria
        conversionWindow={conversionWindow}
        setConversionWindow={setConversionWindow}
      />
    </Flex>
  );
};

export default CreateFunnelAction;
