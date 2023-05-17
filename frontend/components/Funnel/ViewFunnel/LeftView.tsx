import { Box, Flex, Text } from '@chakra-ui/react';
import React from 'react';
import ViewFunnelSteps from '../components/ViewFunnelSteps';
import 'remixicon/fonts/remixicon.css';
import { ConversionWindowObj, FunnelStep } from '@lib/domain/funnel';
import Card from '@components/Card';
import { Clock, UsersFour } from 'phosphor-react';
import ActionPanel from '@components/EventsLayout/ActionPanel';
import { capitalizeFirstLetter } from '@lib/utils/common';
import { GREY_600 } from '@theme/index';
import { ExternalSegmentFilter, WhereFilter } from '@lib/domain/common';
import { getSelectedSegmentsText } from '@components/Metric/util';
import ViewFilter from '@components/StepFilters/ViewFilter';

type LeftViewProps = {
  steps: FunnelStep[];
  conversionWindow: ConversionWindowObj;
  randomSequence: boolean;
  segmentFilters: ExternalSegmentFilter[] | null;
};

const LeftView = ({
  steps,
  conversionWindow,
  randomSequence,
  segmentFilters,
}: LeftViewProps) => {
  const sequenceText = randomSequence ? 'Any order' : 'In sequence';
  return (
    <ActionPanel>
      <Card>
        <Flex direction={'column'} gap={'6'} w={'full'}>
          <Flex direction={'column'} gap={'3'} w={'full'}>
            <Text
              color={'grey.500'}
              fontSize={{ base: 'xs-10', md: 'xs-12' }}
              lineHeight={{ base: 'xs-10', md: 'xs-12' }}
              fontWeight={'400'}
            >
              {`Steps (${sequenceText})`}
            </Text>
            <Box>
              <ViewFunnelSteps steps={steps} />
            </Box>
          </Flex>

          {segmentFilters &&
            segmentFilters.map((segmentFilter, i) => {
              const customSegmentFilters = segmentFilter.custom
                .filters as WhereFilter[];
              return (
                <Flex direction={'column'} gap={'3'} key={i}>
                  <Text
                    fontSize={'xs-12'}
                    lineHeight={'xs-12'}
                    fontWeight={'400'}
                    color={'grey.500'}
                  >
                    Filter
                  </Text>
                  <Card borderRadius={'8'} borderColor={'white.200'} p={'3'}>
                    <Flex direction={'column'} gap={'1'}>
                      <Flex gap={'2'} alignItems={'center'}>
                        <UsersFour size={20} color={GREY_600} />
                        <Text
                          fontSize={'xs-14'}
                          lineHeight={'xs-14'}
                          fontWeight={'500'}
                          maxWidth={'65'}
                          textOverflow={'ellipsis'}
                          overflow={'hidden'}
                          whiteSpace={'nowrap'}
                        >
                          {getSelectedSegmentsText(
                            segmentFilter.includes,
                            segmentFilter.segments
                          )}
                        </Text>
                      </Flex>
                      {Boolean(customSegmentFilters.length) &&
                        customSegmentFilters.map((filter, index: number) => (
                          <Box px={'1'} key={index}>
                            <ViewFilter filter={filter} />
                          </Box>
                        ))}
                    </Flex>
                  </Card>
                </Flex>
              );
            })}
          <Flex direction={'column'} gap={'3'} w={'full'}>
            <Text
              color={'grey.500'}
              fontSize={{ base: 'xs-10', md: 'xs-12' }}
              lineHeight={{ base: 'xs-10', md: 'xs-12' }}
              fontWeight={'400'}
            >
              Conversion Time
            </Text>

            <Card borderColor={'white.200'}>
              <Flex dir={'column'} alignItems={'center'} gap={2}>
                <Clock size={20} color={GREY_600} />
                <Text
                  fontSize={'xs-14'}
                  lineHeight={'xs-14'}
                  fontWeight={'medium'}
                  color={'black'}
                  data-testid={'conversion-criteria'}
                >{`${conversionWindow.value} ${capitalizeFirstLetter(
                  conversionWindow.type
                )}`}</Text>
              </Flex>
            </Card>
          </Flex>
        </Flex>
      </Card>
    </ActionPanel>
  );
};

export default LeftView;
