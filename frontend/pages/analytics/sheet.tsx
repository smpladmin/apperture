import React, { useState, useRef } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
} from '@chakra-ui/react';
import sanitizeHtml from 'sanitize-html';

const Spreadsheet = () => {
  const [data, setData] = useState([
    ['', '', ''],
    ['', '', ''],
    ['', '', ''],
  ]);

  const tableRef = useRef(null);

  const handleCellChange = (event, row, col) => {
    const sanitizeConf = {
      allowedTags: ['b', 'i', 'a', 'p'],
      allowedAttributes: { a: ['href'] },
    };
    const sanitizedContent = sanitizeHtml(
      event.currentTarget.innerHTML,
      sanitizeConf
    );
    const updatedData = [...data];
    updatedData[row][col] = sanitizedContent;
    setData(updatedData);
    setEditedCell({ row, col, value: sanitizedContent });
  };

  const handleKeyDown = (event, row, col) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const currentTableRow = row + 1;
      const nextRow = currentTableRow === data.length ? 0 : currentTableRow + 1;
      const nextCell = tableRef.current.rows[nextRow].cells[col];
      nextCell.focus();
    }
  };

  const [editedCell, setEditedCell] = React.useState(null);
  const [showEditableCell, setShowEditableCell] = useState(false);
  const [editableCellStyle, setShowEditableCellStyle] = useState({});

  const handleDoubleClick = (event, row, col) => {
    const el = event.target;
    const position = el.getBoundingClientRect();
    console.log('positioning', position);
    const style = {
      left: position.x,
      top: position.y,
      height: position.height,
      width: 'fit-content',
      minWidth: position.width,
    };

    setShowEditableCell(true);
    setShowEditableCellStyle(style);
  };

  return (
    <Table ref={tableRef}>
      <Thead>
        <Tr>
          <Th>
            <Box width="4px" bg="gray.400" />
            Cell 1
          </Th>
          <Th>
            <Box width="4px" bg="gray.400" />
            Cell 2
          </Th>
          <Th>
            <Box width="4px" bg="gray.400" />
            Cell 3
          </Th>
        </Tr>
      </Thead>
      <Tbody>
        {data.map((row, rowIndex) => (
          <Tr key={rowIndex}>
            {row.map((cell, colIndex) => (
              <Td
                maxW={24}
                height={6}
                // textOverflow={'clip'}
                overflowY={'hidden'}
                key={`${rowIndex}-${colIndex}`}
                // contentEditable
                onBlur={(event) => handleCellChange(event, rowIndex, colIndex)}
                onKeyDown={(event) => handleKeyDown(event, rowIndex, colIndex)}
                onDoubleClick={(e) => handleDoubleClick(e, rowIndex, colIndex)}
                style={{
                  backgroundColor:
                    editedCell &&
                    editedCell.rowIndex === rowIndex &&
                    editedCell.colIndex === colIndex
                      ? '#f5f5f5'
                      : '',
                  padding: '8px',
                  border: '1px solid #ccc',
                  textAlign: 'left',
                }}
              >
                {cell}
              </Td>
            ))}
          </Tr>
        ))}
      </Tbody>
      {showEditableCell && (
        <Box
          ref={(el) => el?.focus()}
          contentEditable
          position={'absolute'}
          style={editableCellStyle}
          zIndex={'99'}
          border={'1px solid blue'}
          max
        ></Box>
      )}
    </Table>
  );
};

export default Spreadsheet;
