import { Column, Id, ReactGrid, Row } from '@silevis/reactgrid';
import React from 'react';

const Grid = ({ sheetData }: any) => {
  const getColumns = (headers: any[]): any[] => {
    return headers.map((header) => {
      return { columnId: header, resizable: true };
    });
  };

  const getHeaderRow = (headers: any[]): Row => {
    return {
      rowId: 'header',
      cells: headers.map((header) => {
        return { type: 'header', text: header };
      }),
    };
  };

  const getRows = (data: any[], headers: any[]): Row[] => [
    getHeaderRow(headers),
    ...data.map<Row>((person, idx) => ({
      rowId: idx,
      cells: headers.map((header) => {
        return { type: 'text', text: person[header] };
      }),
    })),
  ];

  const [columns, setColumns] = React.useState<Column[]>(
    getColumns(sheetData.headers)
  );

  const rows = getRows(sheetData.data, sheetData.headers);

  const handleColumnResize = (ci: Id, width: number) => {
    setColumns((prevColumns) => {
      const columnIndex = prevColumns.findIndex((el) => el.columnId === ci);
      const resizedColumn = prevColumns[columnIndex];
      const updatedColumn = { ...resizedColumn, width };
      prevColumns[columnIndex] = updatedColumn;
      return [...prevColumns];
    });
  };

  return (
    <ReactGrid
      rows={rows}
      columns={columns}
      onColumnResized={handleColumnResize}
    />
  );
};

export default Grid;
