// import { Column, Id, ReactGrid, Row } from '@silevis/reactgrid';
// import React from 'react';
// interface Person {
//   name: string;
//   surname: string;
// }

// const getPeople = (): Person[] => [
//   { name: 'Thomas', surname: 'Goldman' },
//   { name: 'Susie', surname: 'Quattro' },
//   { name: 'Nags', surname: 'MR' },
// ];

// const getColumns = (): Column[] => [
//   { columnId: 'name', width: 150, resizable: true },
//   { columnId: 'surname', width: 150, resizable: true },
// ];

// const headerRow: Row = {
//   rowId: 'header',
//   cells: [
//     { type: 'header', text: 'Name' },
//     { type: 'header', text: 'Surname' },
//   ],
// };

// const getRows = (people: Person[]): Row[] => [
//   headerRow,
//   ...people.map<Row>((person, idx) => ({
//     rowId: idx,
//     cells: [
//       {
//         type: 'text',
//         text: 'hi',
//       },
//       {
//         type: 'dropdown',
//         selectedValue: 'Anish',
//         isOpen: false,
//         values: [
//           { label: 'Anish', value: 'Anish' },
//           { label: 'Aditya', value: 'Aditya' },
//           { label: 'Roopak', value: 'Roopak' },
//         ],
//       },
//     ],
//   })),
// ];

// const Spreadsheet = () => {
//   const [people] = React.useState<Person[]>(getPeople());
//   const [columns, setColumns] = React.useState<Column[]>(getColumns());

//   const rows = getRows(people);

//   const handleColumnResize = (ci: Id, width: number) => {
//     setColumns((prevColumns) => {
//       const columnIndex = prevColumns.findIndex((el) => el.columnId === ci);
//       const resizedColumn = prevColumns[columnIndex];
//       const updatedColumn = { ...resizedColumn, width };
//       prevColumns[columnIndex] = updatedColumn;
//       return [...prevColumns];
//     });
//   };

//   return (
//     <ReactGrid
//       rows={rows}
//       columns={columns}
//       onColumnResized={handleColumnResize}
//     />
//   );
// };

// export default Spreadsheet;
