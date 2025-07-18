import React, { useState } from 'react';
import '../Styles/Table.css';
import Pagination from './Pagination';


interface Column {
  key: string;
  header: string;
  render?: (row: Record<string, any>) => React.ReactNode;
}

interface TableProps {
  columns: Column[];
  data: Record<string, any>[];
  renderActions?: (row: Record<string, any>) => React.ReactNode;
  disableInternalPagination?: boolean;
}

const Table: React.FC<TableProps> = ({ columns, data, renderActions, disableInternalPagination = true }) => {
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
            displayData.map((row: Record<string, any>, idx: number) => (
              <tr key={`${row.id}-${idx}`}>
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render
                      ? col.render(row)
                      : typeof row[col.key] === 'number' 
                        ? row[col.key].toString()
                        : row[col.key]}
                  </td>
                ))}
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