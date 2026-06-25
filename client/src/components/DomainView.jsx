import React from "react";

const DomainView = ({
  domainScrollRef,
  selectedDomainScrollRef,
  domains,
  selectedDomain,
  setSelectedDomain,
  domainPins,
  loading,
  onDelete,
  formatDateTime,
}) => {
  return (
    <div className="flex flex-col lg:flex-row h-full min-h-0 gap-4">
      {/* LEFT / TOP: Domains List */}
      <div className="w-full lg:w-72 bg-slate-900 rounded-lg border shadow-sm flex flex-col overflow-hidden">
        <div className="hidden lg:block p-4 font-bold text-gray-200 border-b border-slate-700 shrink-0">
          Domains
        </div>

        <div
          ref={domainScrollRef}
          className="flex lg:flex-col p-2 lg:p-0 overflow-x-auto lg:overflow-y-auto flex-1 min-h-0"
        >
          {domains.map((domain) => (
            <button
              key={domain._id}
              onClick={() => setSelectedDomain(domain._id)}
              className={`shrink-0 lg:w-full text-left p-3 lg:p-4 flex items-center lg:justify-between rounded-lg lg:rounded-none transition-colors ${
                selectedDomain === domain._id
                  ? "bg-slate-800 text-white lg:border-l-4 border-b-4 lg:border-b-0 border-blue-600"
                  : "text-gray-400 hover:bg-slate-700 hover:text-gray-200 border-b-4 lg:border-b-0 lg:border-l-4 border-transparent"
              }`}
            >
              <div className="font-medium truncate max-w-30 lg:max-w-none">
                {domain._id}
              </div>

              <div className="text-sm opacity-70 ml-2 lg:ml-0">
                ({domain.count})
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT / BOTTOM: Pins Feed */}
      <div
        ref={selectedDomainScrollRef}
        className="flex-1 min-h-0 bg-slate-900 rounded-lg border overflow-y-auto"
      >
        {loading ? (
          <div className="p-10 text-center text-gray-400">
            Loading...
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {domainPins.map((pin) => (
              <div
                key={pin._id}
                className="border border-slate-800 bg-slate-950 rounded-lg overflow-hidden flex flex-col sm:flex-row"
              >
                {/* Screenshot */}
                <img
                  src={pin.screenshot}
                  alt={pin.title}
                  className="w-full h-48 sm:w-64 sm:h-40 object-cover shrink-0"
                />

                {/* Content */}
                <div className="flex-1 p-4 min-w-0 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-200 truncate">
                      {pin.title}
                    </h3>

                    <a
                      href={pin.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-500 hover:text-blue-400 hover:underline block mb-2 truncate text-sm"
                    >
                      {pin.url}
                    </a>

                    <p className="text-gray-500 text-xs sm:text-sm mt-1 sm:mt-2">
                      Captured: {formatDateTime(pin.createdAt)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    <a
                      href={pin.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 sm:flex-none text-center px-4 py-2 bg-gray-100 text-gray-700 rounded border border-gray-300 text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      Open Site
                    </a>

                    <button
                      onClick={() => onDelete(pin._id)}
                      className="flex-1 sm:flex-none text-center px-4 py-2 bg-red-100 text-red-600 border border-red-300 rounded text-sm font-medium hover:bg-red-200 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {domainPins.length === 0 && !loading && (
              <div className="py-8 text-center text-gray-500">
                No pins found for this domain.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DomainView;