import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center px-4">
      {/* 404 */}
      <h1 className="text-[40vw] leading-none font-extrabold text-slate-900 opacity-10 select-none">
        404
      </h1>

      {/* Content */}
      <div className="-mt-10 flex flex-col items-center">
        <h2 className="text-3xl font-bold text-slate-900">
          Page Not Found
        </h2>

        <p className="mt-3 text-gray-500 max-w-md">
          Sorry, the page you are looking for does not exist.
        </p>

        <Link
          to="/"
          className="mt-6 px-6 py-2 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition"
        >
          Go To Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;