import React from "react";
import {
  Pagination,
  PaginationItem,
  PaginationLink,
} from "reactstrap";

const DEFAULT_PAGE_SIZE = 10;
const PAGE_BUTTON = 36;

function range(start, end) {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function getPageNumbers(currentPage, totalPages, maxTokens) {
  const limit = Math.max(1, maxTokens || 1);
  if (totalPages <= limit) return range(1, totalPages);
  if (limit < 5) {
    const start = Math.max(1, Math.min(currentPage - Math.floor((limit - 1) / 2), totalPages - limit + 1));
    return range(start, start + limit - 1);
  }

  const siblingCount = Math.max(0, Math.floor((limit - 5) / 2));
  const leftSibling = Math.max(currentPage - siblingCount, 1);
  const rightSibling = Math.min(currentPage + siblingCount, totalPages);
  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < totalPages - 1;

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftCount = 3 + (siblingCount * 2);
    return [...range(1, leftCount), "ellipsis-right", totalPages];
  }
  if (showLeftEllipsis && !showRightEllipsis) {
    const rightCount = 3 + (siblingCount * 2);
    return [1, "ellipsis-left", ...range(totalPages - rightCount + 1, totalPages)];
  }
  return [1, "ellipsis-left", ...range(leftSibling, rightSibling), "ellipsis-right", totalPages];
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
  const rootRef = React.useRef(null);
  const [width, setWidth] = React.useState(0);

  React.useEffect(() => {
    const node = rootRef.current;
    if (!node || typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver((entries) => {
      const next = Math.floor(entries[0].contentRect.width);
      setWidth((current) => (Math.abs(current - next) < 2 ? current : next));
    });
    observer.observe(node);
    setWidth(Math.floor(node.getBoundingClientRect().width));
    return () => observer.disconnect();
  }, []);

  const pageSlots = width === 0 ? 5 : Math.max(1, Math.floor((Math.max(width, PAGE_BUTTON) + 4) / PAGE_BUTTON) - 2);
  const pageNumbers = getPageNumbers(currentPage, totalPages, pageSlots);

  if (totalItems === 0) {
    return (
      <div className="table-pagination" ref={rootRef}>
        <span className="table-pagination__summary">Sin resultados</span>
      </div>
    );
  }

  return (
    <div className="table-pagination" ref={rootRef}>
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
