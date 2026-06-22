import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";

import api from "../Api/apiInterceptor";

const useDomainPins = (userId) => {
  const domainScrollRef = useRef(null);

  const [domains, setDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [domainPins, setDomainPins] = useState([]);
  const [domainLoading, setDomainLoading] = useState(false);
  const [domainError, setDomainError] = useState(null);

  const fetchDomains = async (req, res) => {
    try {
      const { data } = await api.get(`/api/get-domains/${userId}`);

      if (data.success) {
        setDomains(data.domains);

        if (data.domains.length > 0) {
          setSelectedDomain(data.domains[0]._id);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(error);
    }
  };

  const fetchDomainPins = async (domain) => {
    try {
      setDomainLoading(true);

      const { data } = await api.get(
        `/api/get-domains-pins/${userId}/${encodeURIComponent(domain)}`,
      );

      if (data.success) {
        setDomainPins(data.pins);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load domain pins");
    } finally {
      setDomainLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedDomain) return;

    fetchDomainPins(selectedDomain);
  }, [selectedDomain]);

  return {
    domainScrollRef,
    domains,
    selectedDomain,
    setSelectedDomain,
    domainPins,
    domainLoading,
    domainError,
    fetchDomains,
    fetchDomainPins,
  };
};

export default useDomainPins;
