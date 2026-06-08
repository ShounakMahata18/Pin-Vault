import React, { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import PinCard from "../components/PinCard";
import DomainView from "../components/DomainView";
import { AppData } from "../context/AppContext";
import { toast } from "react-toastify";

import api from "../Api/apiInterceptor.js";

const backend_URL =
  import.meta.env.VITE_REACT_APP_BACKEND_URL || "http://localhost:5000";

const Home = () => {
  // users data
  const { user } = AppData();
  const userId = user?._id;

  // helper
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // view
  const [view, setView] = useState("list");

  // List view
  const scrollRef = useRef(null);
  const [listPins, setListPins] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Domain view
  const [domains, setDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [domainPins, setDomainPins] = useState([]);
  const [domainLoading, setDomainLoading] = useState(false);

  const formatDateTime = (dateString) => {
    if (!dateString) return "Unknown Date";

    return new Date(dateString).toLocaleString();
  };

  const fetchListPins = async (pageNumber = 1) => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);

    try {
      const { data } = await api.get(
        `/api/get-pins/${userId}?page=${pageNumber}&limit=20`,
      );

      if (data.success) {
        setListPins((prev) =>
          pageNumber === 1 ? data.pins : [...prev, ...data.pins],
        );

        setHasMore(data.hasMore);
        setPage(pageNumber);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load pins");
      setError("Failed to load pins.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDomains = async (req, res) => {
    try {
      const { data } = await api.get(`/api/get-domains/${userId}`);

      if (data.success) {
        setDomains(data.domains);

        if (data.domains.length > 0) {
          setSelectedDomain(data.domains[0]._id);
        }
      }

      console.log(data.domains);
    } catch (error) {
      console.error(error);
      toast.error(error);
    }
  };

  const fetchDomainPins = async (domain) => {
    try {
      setDomainLoading(true);

      const { data } = await api.get(
        `/api/get-domains/${userId}/${encodeURIComponent(domain)}`,
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

  const handleDelete = async (pinId) => {
    // if (!window.confirm("Are you sure you want to delete this pin?")) return;

    try {
      const { data } = await api(`api/delete-pin/${pinId}`, {
        method: "DELETE",
      });

      if (data.success) {
        setListPins((prevPins) => prevPins.filter((pin) => pin._id !== pinId));

        toast.success("Pin deleted successfully");
      } else {
        toast.error(data.message || "Failed to delete pin");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting pin");
    }
  };

  useEffect(() => {
    if (userId) {
      setListPins([]);
      setPage(1);
      setHasMore(true);
      setError(null);

      fetchListPins(1);
    }
  }, [userId]);

  useEffect(() => {
    const container = scrollRef.current;

    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;

      const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

      if (distanceFromBottom < 500 && !isLoading && hasMore) {
        fetchListPins(page + 1);
      }
    };

    container.addEventListener("scroll", handleScroll);

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [page, isLoading, hasMore]);

  useEffect(() => {
    if (view !== "domain") return;

    fetchDomains();
  }, [view]);

  useEffect(() => {
    if (!selectedDomain) return;

    fetchDomainPins(selectedDomain);
  }, [selectedDomain]);

  return (
    <div className="h-screen overflow-hidden bg-slate-950 font-sans flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 pb-6 flex flex-col overflow-hidden">
        <div className="flex px-1 flex-wrap justify-end gap-3 mb-2">
          <button
            onClick={() => setView("list")}
            className={`p-1 transition-colors ${
              view === "list"
                ? "text-blue-500"
                : "text-gray-200 hover:text-gray-400"
            }`}
          >
            <svg
              className="w-6 h-6"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
            >
              {/* I changed the Y-coordinates from 8,12,16 to 4,12,20 to stretch the lines top-to-bottom */}
              <path
                d="M7 4H21 M7 12H21 M7 20H21 M3 4H3.01 M3 12H3.01 M3 20H3.01"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <button
            onClick={() => setView("domain")}
            className={`p-1 transition-colors ${
              view === "domain"
                ? "text-blue-500"
                : "text-gray-200 hover:text-gray-400"
            }`}
          >
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
            >
              {/* This icon acts as our baseline for the height (it goes from Y=3 to Y=21) */}
              <path d="M10 3H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zm10 10h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1zM17 3c-2.206 0-4 1.794-4 4s1.794 4 4 4 4-1.794 4-4-1.794-4-4-4zM7 13c-2.206 0-4 1.794-4 4s1.794 4 4 4 4-1.794 4-4-1.794-4-4-4z" />
            </svg>
          </button>

          <button
            onClick={() => setView("date")}
            className={`p-1 transition-colors ${
              view === "date"
                ? "text-blue-500"
                : "text-gray-200 hover:text-gray-400"
            }`}
          >
            <svg
              className="w-6 h-6"
              /* I changed the viewBox from "-0.5 0 15 15" to "-1.5 -1 17 17" to add internal padding so it shrinks to match the others */
              viewBox="-1.5 -1 17 17"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M107,154.006845 C107,153.45078 107.449949,153 108.006845,153 L119.993155,153 C120.54922,153 121,153.449949 121,154.006845 L121,165.993155 C121,166.54922 120.550051,167 119.993155,167 L108.006845,167 C107.45078,167 107,166.550051 107,165.993155 L107,154.006845 Z M108,157 L120,157 L120,166 L108,166 L108,157 Z M116.5,163.5 L116.5,159.5 L115.757485,159.5 L114.5,160.765367 L114.98503,161.275112 L115.649701,160.597451 L115.649701,163.5 L116.5,163.5 Z M112.5,163.5 C113.412548,163.5 114,163.029753 114,162.362119 C114,161.781567 113.498099,161.473875 113.110266,161.433237 C113.532319,161.357765 113.942966,161.038462 113.942966,160.550798 C113.942966,159.906386 113.395437,159.5 112.505703,159.5 C111.838403,159.5 111.359316,159.761248 111.051331,160.115385 L111.456274,160.632075 C111.724335,160.370827 112.055133,160.231495 112.425856,160.231495 C112.819392,160.231495 113.13308,160.382438 113.13308,160.690131 C113.13308,160.974601 112.847909,161.102322 112.425856,161.102322 C112.28327,161.102322 112.020913,161.102322 111.952471,161.096517 L111.952471,161.839623 C112.009506,161.833817 112.26616,161.828012 112.425856,161.828012 C112.956274,161.828012 113.190114,161.967344 113.190114,162.275036 C113.190114,162.565312 112.93346,162.768505 112.471483,162.768505 C112.10076,162.768505 111.684411,162.605951 111.427757,162.327286 L111,162.87881 C111.279468,163.227141 111.804183,163.5 112.5,163.5 Z M110,152.5 C110,152.223858 110.214035,152 110.504684,152 L111.495316,152 C111.774045,152 112,152.231934 112,152.5 L112,153 L110,153 L110,152.5 Z M116,152.5 C116,152.223858 116.214035,152 116.504684,152 L117.495316,152 C117.774045,152 118,152.231934 118,152.5 L118,153 L116,153 L116,152.5 Z"
                transform="translate(-107 -152)"
              />
            </svg>
          </button>
        </div>

        {error && <p className="text-center text-red-600 mb-4">{error}</p>}

        <div ref={scrollRef} className="flex-1 overflow-y-auto pr-2">
          {view === "list" && (
            <PinCard
              listPins={listPins}
              isLoading={isLoading}
              hasMore={hasMore}
              onDelete={handleDelete}
              formatDateTime={formatDateTime}
            />
          )}

          {view === "domain" && (
            <DomainView
              domains={domains}
              selectedDomain={selectedDomain}
              setSelectedDomain={setSelectedDomain}
              domainPins={domainPins}
              loading={domainLoading}
              onDelete={handleDelete}
              formatDateTime={formatDateTime}
            />
          )}

          {view === "date" && (
            <div className="space-y-4">
              {listPins.map((pin) => (
                <div
                  key={pin._id}
                  className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
                >
                  <h3 className="text-lg font-semibold mb-2 text-gray-800">
                    {pin.title}
                  </h3>

                  <p className="text-sm text-gray-500">
                    Saved: {formatDateTime(pin.savedAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;
