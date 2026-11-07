import React from 'react';
import TablePagination from '../Pagination/TablePagination';

export default function PageControls({ data, onChange }) {
  return <TablePagination currentPage={data.page} totalItems={data.total}
    totalPages={Math.max(1, Math.ceil(data.total / data.pageSize))}
    startIndex={(data.page - 1) * data.pageSize}
    endIndex={Math.min(data.page * data.pageSize, data.total)} setCurrentPage={onChange} />;
}
