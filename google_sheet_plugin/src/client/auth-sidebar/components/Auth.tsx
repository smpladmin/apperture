import { Box, Button, Flex, Image, Input } from '@chakra-ui/react';
import React, { FormEvent, useState } from 'react';
import { serverFunctions } from '../../utils/serverFunctions';
import AppertureSvg from './AppertureSvg';

const Auth = () => {
  const [value, setValue] = useState('');

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    localStorage.setItem('apiKey', value);
    serverFunctions.showAlert('Auth Key Saved!');
  };

  return (
    <Box p={'2'}>
      <Flex justifyContent={'center'} mb={'4'}>
        <AppertureSvg />
      </Flex>
      <form onSubmit={onSubmit}>
        <Flex direction={'column'} gap={'2'} alignItems={'center'}>
          <Input
            placeholder="Enter key"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <Button className="submit" type="submit" w={'fit-content'} p={'2'}>
            Submit
          </Button>
        </Flex>
      </form>
    </Box>
  );
};

export default Auth;
