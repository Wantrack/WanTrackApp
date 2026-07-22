import React from "react";
import { axios } from "../../config/https";

const DEFAULT_PAGE_SIZE = 10;

function useServerPagination(buildUrl, dependencies = [], pageSize = DEFAULT_PAGE_SIZE) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [items, setItems] = React.useState([]);
  const [totalItems, setTotalItems] = React.useState(0);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setCurrentPage(1);
  }, dependencies);

  React.useEffect(() => {
    let isMounted = true;
    setLoading(true);

    axios.get(buildUrl({ page: currentPage, pageSize })).then((result) => {
      if (!isMounted) return;

      if (Array.isArray(result.data)) {
        setItems(result.data);
        setTotalItems(result.data.length);
        return;
      }

      setItems(Array.isArray(result.data?.data) ? result.data.data : []);
      setTotalItems(Number(result.data?.total || 0));
    }).catch(() => {
      if (isMounted) {
        setItems([]);
        setTotalItems(0);
      }
    }).finally(() => {
      if (isMounted) {
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [buildUrl, currentPage, pageSize]);

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + items.length, totalItems);

  return {
    currentPage,
    endIndex,
    loading,
    pageSize,
    paginatedItems: items,
    setCurrentPage,
    startIndex,
    totalItems,
    totalPages,
  };
}

export default useServerPagination;
