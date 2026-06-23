import React from "react";

const ListView = ({
  listScrollRef,
  listError,
  listPins,
  loading,
  hasMore,
  onDelete,
  formatDateTime,
}) => {
  return (
    <div ref={listScrollRef} className="flex-1 overflow-y-auto pr-2">
      {listError && (
        <p className="text-center text-red-600 mb-4">
          {listError}
        </p>
      )}

      {listPins.map((pin) => (
        <div
          key={pin._id}
          className="flex flex-col sm:flex-row sm:items-center bg-slate-900 p-4 mb-4 rounded-lg shadow-sm gap-4 sm:gap-0"
        >
          {/* Screenshot */}
          <div className="shrink-0 sm:mr-6 w-full sm:w-auto">
            <img
              src={pin.screenshot}
              alt={pin.title}
              className="w-full sm:w-64 aspect-video object-cover rounded border border-slate-700 shadow-sm"
            />
          </div>

          {/* Content */}
          <div className="grow min-w-0 w-full sm:w-auto">
            <h2 className="text-lg font-semibold mb-1 text-gray-200 truncate">
              {pin.title}
            </h2>

            <a
              href={pin.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-400 hover:underline block mb-2 truncate text-sm sm:text-base"
            >
              {pin.url}
            </a>

            <p className="text-xs sm:text-sm text-gray-500">
              Captured: {formatDateTime(pin.savedAt)}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 shrink-0 sm:ml-4 w-full sm:w-auto mt-2 sm:mt-0">
            <a
              href={pin.url}
              target="_blank"
              rel="noopener noreferrer"
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
      ))}

      {loading && (
        <div className="py-6 text-center text-gray-500">
          Loading more pins...
        </div>
      )}

      {!loading && listPins.length === 0 && !listError && (
        <div className="py-10 text-center text-gray-400">
          No pins found
        </div>
      )}

      {!hasMore && listPins.length > 0 && (
        <div className="py-6 text-center text-gray-400">
          No more pins to load
        </div>
      )}
    </div>
  );
};

export default ListView;