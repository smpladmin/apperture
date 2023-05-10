import { Text } from '@chakra-ui/react';

const TableCell = ({ children, ...rest }: { children: any; rest?: any }) => {
  return (
    <Text
      {...rest}
      as={'span'}
      fontWeight={400}
      fontSize={'xs-14'}
      lineHeight={'xs-22'}
      width={'auto'}
      maxWidth={'25'}
      wordBreak={'break-word'}
    >
      {children}
    </Text>
  );
};

export default TableCell;
