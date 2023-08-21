import {
  Box,
  Button,
  Editable,
  EditableInput,
  EditablePreview,
  Flex,
} from '@chakra-ui/react';
import { ChartPie, Percent, PlusCircle, Sigma } from '@phosphor-icons/react';
import { useRouter } from 'next/router';
import { ArrowLeft, Code } from 'phosphor-react';
import Zero from '@assets/icons/NumberCircleZero.svg';
import DoubleZero from '@assets/icons/NumberCircleDoubleZero.svg';

import React from 'react';
import Image from 'next/image';
import PivotIcon from './PivotIcon';

type WorkbookHeaderProps = {
  name: string;
  setName: Function;
  isSaveButtonDisabled: boolean;
  handleSave: Function;
  setShowSqlEditor: Function;
};

const WorkbookHeader = ({
  name,
  setName,
  isSaveButtonDisabled,
  handleSave,
  setShowSqlEditor,
}: WorkbookHeaderProps) => {
  const router = useRouter();
  const { dsId } = router.query;
  const disabledIconStyle = { color: '#bdbdbd', cursor: 'no-drop' };
  return (
    <Box
      position={'sticky'}
      top={'0'}
      width={'full'}
      zIndex={'99'}
      borderWidth={'0.4px'}
      borderColor={'grey.700'}
    >
      <Flex
        background={'white.500'}
        py={'3'}
        px={'5'}
        justifyContent={'space-between'}
        alignItems={'center'}
      >
        <Flex alignItems={'center'} gap={'2'}>
          <Box
            cursor={'pointer'}
            onClick={() => {
              router.push({
                pathname: `/analytics/home/[dsId]`,
                query: { dsId },
              });
            }}
          >
            <ArrowLeft />
          </Box>
          <Editable
            onChange={(nextValue) => setName(nextValue)}
            defaultValue={name}
            fontSize={'xs-16'}
            lineHeight={'xs-16'}
            fontWeight={'500'}
            color={'black.DEFAULT'}
          >
            <EditablePreview
              cursor={'pointer'}
              p={'2'}
              _hover={{ bg: 'white.200' }}
              borderRadius={'12'}
            />
            <EditableInput
              border={'1px'}
              borderColor={'grey.400'}
              borderRadius={'12'}
              bg={'white.DEFAULT'}
              p={'2'}
              data-testid={'entity-name'}
            />
          </Editable>
        </Flex>
        <Flex alignItems={'center'} gap={'2'}>
          <Button
            fontSize={'xs-14'}
            lineHeight={'xs-14'}
            fontWeight={'500'}
            py={'6px'}
            pl={'3'}
            pr={'4'}
            color={''}
            bg={'white.200'}
            _hover={{ bg: 'grey.400' }}
            borderRadius={'8'}
            onClick={() => setShowSqlEditor(true)}
          >
            <Flex alignItems={'center'} gap={'1'}>
              <Code size={16} />
              {'SQL'}
            </Flex>
          </Button>
          <Button
            variant={'primary'}
            px={'4'}
            py={'6px'}
            fontSize={'xs-14'}
            lineHeight={'xs-14'}
            fontWeight={'500'}
            bg={'black.DEFAULT'}
            color={'white.DEFAULT'}
            borderRadius={'8'}
            disabled={isSaveButtonDisabled}
            onClick={() => handleSave()}
          >
            {'Save'}
          </Button>
        </Flex>
      </Flex>
      <Flex
        background={'gray.200'}
        height={9}
        borderRadius={'13px'}
        m={'6px 12px'}
        alignItems={'center'}
      >
        <PlusCircle style={{ margin: '6px', ...disabledIconStyle }} />
        <ChartPie
          style={{
            margin: '6px',
            ...disabledIconStyle,
          }}
        />

        <PivotIcon />
        <Percent style={{ margin: '6px', ...disabledIconStyle }} />
        <Sigma style={{ margin: '6px', ...disabledIconStyle }} />
        <Image src={Zero} alt={'Zero'} style={disabledIconStyle} />
        <Image src={DoubleZero} alt={'Double Zero'} style={disabledIconStyle} />
      </Flex>
      <Box bg={'white.DEFAULT'} h={'8'}></Box>
    </Box>
  );
};

export default WorkbookHeader;
