import { Box, Checkbox, Flex, Text } from '@chakra-ui/react';
import { ProviderDataSource as DataSource } from '@lib/domain/datasource';

type ProviderDataSourceProps = {
  datasource: DataSource;
};

export const ProviderDataSource = ({ datasource }: ProviderDataSourceProps) => {
  return (
    <Checkbox
      value={datasource._id}
      gap={'14.5px'}
      paddingY={4}
      paddingX={3}
      borderWidth={'1px'}
      borderRadius={'12px'}
      bgColor={'white.Default'}
      borderColor={'white.200'}
      colorScheme={'radio'}
      _checked={{
        backgroundColor: 'white.100',
        borderColor: 'black',
        fontWeight: '500',
        cursor: 'pointer',
      }}
    >
      <Box>
        <Text
          noOfLines={1}
          lineHeight={'base'}
          fontSize={'base'}
          fontWeight={'500'}
        >
          {datasource.name}
        </Text>
        <Flex justifyContent={'space-between'} mt={'0.375rem'}>
          <Text
            lineHeight={'xs-12'}
            fontSize={'xs-12'}
            fontWeight={'400'}
            color={'grey.200'}
            width={'40'}
          >
            {datasource._id}
          </Text>
          <Text
            lineHeight={'xs-12'}
            fontSize={'xs-12'}
            fontWeight={'400'}
            color={'grey.200'}
          >
            {datasource.version}
          </Text>
        </Flex>
      </Box>
    </Checkbox>
  );
};
