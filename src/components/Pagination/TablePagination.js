import React from "react";
import {
  Pagination,
  PaginationItem,
  PaginationLink,
} from "reactstrap";

const DEFAULT_PAGE_SIZE = 10;

function getPageNumbers(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, totalPages, currentPage]);

  if (currentPage > 2) pages.add(currentPage - 1);
  if (currentPage < totalPages - 1) pages.add(currentPage + 1);
  if (currentPage <= 3) pages.add(2);
  if (currentPage >= totalPages - 2) pages.add(totalPages - 1);

  const sortedPages = Array.from(pages).sort((a, b) => a - b);
  return sortedPages.reduce((items, page, index) => {
    const previousPage = sortedPages[index - 1];
    if (previousPage && page - previousPage > 1) {
      items.push("ellipsis-" + page);
    }
    items.push(page);
    return items;
  }, []);
}

function useClientPagination(items, pageSize = DEFAULT_PAGE_SIZE) {
  const safeItems = Array.isArray(items) ? items : [];
  const [currentPage, setCurrentPage] = React.useState(1);
  const totalItems = safeItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  React.useEffect(() => {
    setCurrentPage(1);
  }, [totalItems, pageSize]);

  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedItems = safeItems.slice(startIndex, endIndex);

  return {
    currentPage,
    endIndex,
    pageSize,
    paginatedItems,
    setCurrentPage,
    startIndex,
    totalItems,
    totalPages,
  };
}

function TablePagination({
  currentPage,
  endIndex,
  setCurrentPage,
  startIndex,
  totalItems,
  totalPages,
}) {
  if (totalItems === 0) {
    return (
      <div className="table-pagination">
        <span className="table-pagination__summary">Sin resultados</span>
      </div>
    );
  }

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <div className="table-pagination">
      <span className="table-pagination__summary">
        Mostrando {startIndex + 1}-{endIndex} de {totalItems}
      </span>
      {totalPages > 1 && (
        <Pagination className="table-pagination__controls">
          <PaginationItem disabled={currentPage === 1}>
            <PaginationLink
              href="#"
              previous
              onClick={(event) => {
                event.preventDefault();
                setCurrentPage(Math.max(1, currentPage - 1));
              }}
            />
          </PaginationItem>
          {pageNumbers.map((page) => (
            typeof page === "number" ? (
              <PaginationItem key={page} active={page === currentPage}>
                <PaginationLink
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    setCurrentPage(page);
                  }}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ) : (
              <PaginationItem key={page} disabled>
                <PaginationLink href="#" onClick={(event) => event.preventDefault()}>
                  ...
                </PaginationLink>
              </PaginationItem>
            )
          ))}
          <PaginationItem disabled={currentPage === totalPages}>
            <PaginationLink
              href="#"
              next
              onClick={(event) => {
                event.preventDefault();
                setCurrentPage(Math.min(totalPages, currentPage + 1));
              }}
            />
          </PaginationItem>
        </Pagination>
      )}
    </div>
  );
}

export { useClientPagination };
export default TablePagination;
