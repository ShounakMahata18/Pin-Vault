import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";

import api from "../Api/apiInterceptor";

const useListPins = (userId, enabled = true, limit = 10) => {
  const listScrollRef = useRef(null);

  const [listPins, setListPins] = useState([]);
  const [listPage, setListPage] = useState(1);
  const [listHasMore, setListHasMore] = useState(true);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState(null);

  const fetchListPins = async (pageNumber = 1) => {
    if (listLoading || !listHasMore) return;

    setListLoading(true);

    try {
      const { data } = await api.get(
        `/api/get-pins/${userId}?page=${pageNumber}&limit=${limit}`,
      );

      if (data.success) {
        setListPins((prev) =>
          pageNumber === 1 ? data.pins : [...prev, ...data.pins],
        );

        setListHasMore(data.hasMore);
        setListPage(data.page);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load pins");
      setListError("Failed to load pins.");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    const container = listScrollRef.current;

    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;

      const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

      if (distanceFromBottom < 500 && !listLoading && listHasMore) {
        fetchListPins(listPage + 1);
      }
    };

    container.addEventListener("scroll", handleScroll);

    return () => container.removeEventListener("scroll", handleScroll);
  }, [enabled, listPage, listLoading, listHasMore]);

  return {
    listScrollRef,
    listPins,
    listLoading,
    listError,
    listHasMore,
    listPage,
    fetchListPins,
    setListPins,
  };
};

export default useListPins;
