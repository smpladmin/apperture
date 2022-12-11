import { Skeleton, Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';
import React from 'react';

const TableSkeleton = ({ tableHeader }: { tableHeader: string[] }) => {
  return (
    <Table>
      <Thead py={'3'} px={'8'} bg={'white.100'}>
        <Tr>
          {tableHeader.map((heading) => (
            <Th key={`skeleton_${heading}`}>{heading}</Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        <Tr>
          {tableHeader.map((heading, index) => (
            <Td key={`skeleton_${heading}_${index}_1`}>
              <Skeleton height="20px" />
            </Td>
          ))}
        </Tr>
        <Tr>
          {tableHeader.map((heading, index) => (
            <Td key={`skeleton_${heading}_${index}_2`}>
              <Skeleton height="20px" />
            </Td>
          ))}
        </Tr>
        <Tr>
          {tableHeader.map((heading, index) => (
            <Td key={`skeleton_${heading}_${index}_3`}>
              <Skeleton height="20px" />
            </Td>
          ))}
        </Tr>
      </Tbody>
    </Table>
  );
};

export default TableSkeleton;
