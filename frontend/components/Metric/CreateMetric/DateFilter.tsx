import { Button, ButtonGroup } from '@chakra-ui/react';
import React, { useState } from 'react';

const DateFilter = () => {
  return (
    <ButtonGroup size="sm" isAttached variant="outline">
      <Button
        _focus={{ bg: 'grey.50', color: 'black', fontWeight: 500 }}
        border="1px solid #EDEDED"
        id="yesterday"
        color={'grey.200'}
        fontWeight={400}
        height={8}
        fontSize={'xs-12'}
      >
        Yesterday
      </Button>
      <Button
        _focus={{ bg: 'grey.50', color: 'black', fontWeight: 500 }}
        border="1px solid #EDEDED"
        id="yesterday"
        color={'grey.200'}
        fontWeight={400}
        height={8}
        fontSize={'xs-12'}
      >
        7D
      </Button>
      <Button
        _focus={{ bg: 'grey.50', color: 'black', fontWeight: 500 }}
        border="1px solid #EDEDED"
        id="yesterday"
        color={'grey.200'}
        fontWeight={400}
        height={8}
        fontSize={'xs-12'}
      >
        1W
      </Button>
      <Button
        _focus={{ bg: 'grey.50', color: 'black', fontWeight: 500 }}
        border="1px solid #EDEDED"
        id="yesterday"
        color={'grey.200'}
        fontWeight={400}
        height={8}
        fontSize={'xs-12'}
      >
        1M
      </Button>
      <Button
        _focus={{ bg: 'grey.50', color: 'black', fontWeight: 500 }}
        border="1px solid #EDEDED"
        id="yesterday"
        color={'grey.200'}
        fontWeight={400}
        height={8}
        fontSize={'xs-12'}
      >
        <i style={{ marginRight: '4px' }} className="ri-calendar-line" /> Custom
      </Button>
    </ButtonGroup>
  );
};

export default DateFilter;
