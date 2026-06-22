import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";

import api from "../Api/apiInterceptor";

const useDomainPins = (
  userId,
  enabled = true,
  domainLimit = 20,
  selectedDomainLimit = 10,
) => {
  const domainScrollRef = useRef(null);
  const selectedDomainScrollRef = useRef(null);

  const [domains, setDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [selectedDomainPins, setSelectedDomainPins] = useState([]);
  const [domainPage, setDomainPage] = useState(1);
  const [selectedDomainPage, setSelectedDomainPage] = useState(1);
  const [domainHasMore, setDomainHasMore] = useState(true);
  const [selectedDomainHasMore, setSelectedDomainHasMore] = useState(true);
  const [domainLoading, setDomainLoading] = useState(false);
  const [selectedDomainLoading, setSelectedDomainLoading] = useState(false);
  const [domainError, setDomainError] = useState(null);
  const [selectedDomainError, setSelectedDomainError] = useState(null);

  const fetchDomains = async (pageNumber = 1) => {
    if (domainLoading || !domainHasMore) return;

    setDomainLoading(true);

    try {
      const { data } = await api.get(
        `/api/get-domains/${userId}?page=${pageNumber}&limit=${domainLimit}`,
      );

      if (data.success) {
        setDomains((prev) =>
          pageNumber === 1 ? data.domains : [...prev, ...data.domains],
        );

        setDomainHasMore(data.hasMore);
        setDomainPage(data.page);

        if (pageNumber === 1 && !selectedDomain && data.domains.length > 0) {
          setSelectedDomain(data.domains[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load domains");
      setDomainError("Failed to load domains");
    } finally {
      setDomainLoading(false);
    }
  };

  const fetchSelectedDomainPins = async (domain, pageNumber = 1) => {
    if (pageNumber !== 1 && (selectedDomainLoading || !selectedDomainHasMore))
      return;

    setSelectedDomainLoading(true);

    try {
      const { data } = await api.get(
        `/api/get-domain-pins/${userId}/${encodeURIComponent(domain)}?page=${pageNumber}&limit=${selectedDomainLimit}`,
      );

      if (data.success) {
        setSelectedDomainPins((prev) =>
          pageNumber === 1 ? data.pins : [...prev, ...data.pins],
        );

        setSelectedDomainHasMore(data.hasMore);
        setSelectedDomainPage(data.page);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load domain pins");
      setSelectedDomainError("Failed to load domain pins");
    } finally {
      setSelectedDomainLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedDomain) return;

    setSelectedDomainPins([]);
    setSelectedDomainPage(1);
    setSelectedDomainHasMore(true);

    fetchSelectedDomainPins(selectedDomain);
  }, [selectedDomain]);

  useEffect(() => {
    const container = domainScrollRef.current;

    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;

      const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

      if (distanceFromBottom < 500 && !domainLoading && domainHasMore) {
        fetchDomains(domainPage + 1);
      }
    };

    container.addEventListener("scroll", handleScroll);

    return () => container.removeEventListener("scroll", handleScroll);
  }, [enabled, domainPage, domainLoading, domainHasMore]);

  useEffect(() => {
    const container = selectedDomainScrollRef.current;

    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;

      const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

      if (
        distanceFromBottom < 500 &&
        !selectedDomainLoading &&
        selectedDomainHasMore
      ) {
        fetchSelectedDomainPins(selectedDomain, selectedDomainPage + 1);
      }
    };

    container.addEventListener("scroll", handleScroll);

    return () => container.removeEventListener("scroll", handleScroll);
  }, [
    enabled,
    selectedDomain,
    selectedDomainPage,
    selectedDomainLoading,
    selectedDomainHasMore,
  ]);

  return {
    domainScrollRef,
    selectedDomainScrollRef,
    domains,
    selectedDomain,
    setSelectedDomain,
    selectedDomainPins,
    domainLoading,
    domainError,
    fetchDomains,
    fetchSelectedDomainPins,
  };
};

export default useDomainPins;
