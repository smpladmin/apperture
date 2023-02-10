import { Text } from '@chakra-ui/react';

const TableCell = ({ children }: { children: any }) => {
  return (
    <Text as={'span'} fontWeight={400} fontSize={'xs-14'} lineHeight={'xs-22'}>
      {children}
    </Text>
  );
};

export default TableCell;
