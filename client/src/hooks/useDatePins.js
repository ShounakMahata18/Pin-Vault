import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";

import api from "../Api/apiInterceptor";

const useDatePins = (userId, enabled = true, datePinsLimit = 10) => {
  const dateScrollRef = useRef(null);

  const [date, setDate] = useState(() => new Date().toLocaleDateString("en-CA"));
  const [datePins, setDatePins] = useState([]);
  const [datePage, setDatePage] = useState(1);
  const [dateHasMore, setDateHasMore] = useState(true);
  const [dateLoading, setDateLoading] = useState(false);
  const [dateError, setDateError] = useState(null);

  const fetchDatePins = async (date, pageNumber = 1) => {
    if (pageNumber !== 1 && (dateLoading || !dateHasMore)) return;

    setDateLoading(true);

    try {
      const { data } = await api.get(
        `api/get-date-pins/${userId}/${date}?page=${pageNumber}&limit=${datePinsLimit}`,
      );

      if (data.success) {
        setDatePins((prev) =>
          pageNumber === 1 ? data.pins : [...prev, ...data.pins],
        );
      }

      setDateHasMore(data.hasMore);
      setDatePage(data.page);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load date pins");
      setDateError("Failed to load date pins");
    } finally {
      setDateLoading(false);
    }
  };

  useEffect(() => {
    if (!enabled || !userId) return;

    setDatePins([]);
    setDatePage(1);
    setDateHasMore(true);

    fetchDatePins(date);
  }, [date, enabled, userId]);

  return {
    dateScrollRef,
    date,
    setDate,
    datePins,
    dateLoading,
    dateError,
    dateHasMore,
    datePage,
  };
};

export default useDatePins;
