import React, { useState } from 'react';
import '../Styles/Table.css';
import Pagination from './Pagination';


interface Column<T = Record<string, any>> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
}

interface TableProps<T = Record<string, any>> {
  columns: Column<T>[];
  data: T[];
  renderActions?: (row: T) => React.ReactNode;
  disableInternalPagination?: boolean;
}

const Table = <T extends Record<string, any>>({ 
  columns, 
  data, 
  renderActions, 
  disableInternalPagination = true 
}: TableProps<T>) => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const totalPages = Math.ceil(data.length / rowsPerPage);

  // Use all data if internal pagination is disabled, otherwise paginate
  const displayData = disableInternalPagination ? data : data.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <>
      <div className="table-container">
      <table className="custom-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.header}</th>
            ))}
            {renderActions && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {displayData.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} style={{ textAlign: 'center' }}>No data found.</td>
            </tr>
          ) : (
            displayData.map((row: T, idx: number) => (
              <tr key={`row-${row.id || 'unknown'}-${idx}`}>
                {columns.map((col) => {
                  const cellValue = row[col.key];
                  return (
                    <td key={col.key}>
                      {col.render
                        ? col.render(row)
                        : cellValue === undefined || cellValue === null
                          ? '-'  // Display a dash for undefined/null values
                          : typeof cellValue === 'number'
                            ? cellValue.toString()
                            : cellValue.toString()
                      }
                    </td>
                  );
                })}
                {renderActions && <td className="actions-cell">{renderActions(row)}</td>}
              </tr>
            ))
          )}
        </tbody>
      </table>
      
    </div>
    {!disableInternalPagination && (
      <div>
        <Pagination
          page={page}
          totalPages={totalPages}
          rowsPerPage={rowsPerPage}
          setPage={setPage}
          setRowsPerPage={setRowsPerPage}
        />
      </div>
    )}
    </>
  );
};

export default Table;