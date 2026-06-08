import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import { AppData } from "../context/AppContext";

const Home = () => {
  const { isAuth } = AppData();

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      <Navbar />

      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-0 h-125 w-125 rounded-full bg-blue-500/20 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 h-125 w-125 rounded-full bg-purple-500/20 blur-3xl"></div>
        <div className="absolute inset-0 bg-linear-to-br from-slate-950 via-slate-900 to-slate-950"></div>
      </div>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-20">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-700 bg-slate-900/60">
            <svg
              className="w-4 h-4 text-blue-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M16 3l5 5-4 4 2 6-1 1-6-2-4 4-1-1 4-4-2-6 1-1 6 2 4-4z" />
            </svg>
            Quick Pins Browser Extension
          </div>

          <h1 className="mt-8 text-5xl md:text-7xl font-bold">
            Save Anything
            <span className="block bg-linear-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
              From The Web
            </span>
          </h1>

          <p className="max-w-3xl mx-auto mt-6 text-lg text-slate-300">
            Save webpages, tutorials, resources, articles and projects directly
            from your browser. Everything is securely synced and available in
            your dashboard.
          </p>

          {!isAuth && (
            <div className="flex flex-wrap justify-center gap-4 mt-10">
              <Link
                to="/register"
                className="px-7 py-3 rounded-xl bg-white text-slate-900 font-semibold hover:scale-105 transition"
              >
                Register
              </Link>

              <Link
                to="/login"
                className="px-7 py-3 rounded-xl border border-slate-700 hover:bg-slate-800 transition"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Dashboard Quick Access */}
      {isAuth && (
        <section className="max-w-6xl mx-auto px-6 mb-24">
          <div className="rounded-3xl border border-blue-500/20 bg-linear-to-r from-blue-500/10 to-purple-500/10 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-3xl font-bold">
                Dashboard Available Anytime
              </h2>
              <p className="text-slate-300 mt-2">
                View and manage all your saved pins from one place.
              </p>
            </div>

            <Link
              to="/dashboard"
              className="flex items-center gap-3 bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl transition"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <rect x="3" y="3" width="8" height="8" rx="2" />
                <rect x="13" y="3" width="8" height="5" rx="2" />
                <rect x="13" y="10" width="8" height="11" rx="2" />
                <rect x="3" y="13" width="8" height="8" rx="2" />
              </svg>
              Open Dashboard
            </Link>
          </div>
        </section>
      )}

      {/* Setup Steps */}
      <section className="max-w-7xl mx-auto px-6 pb-32">
        <h2 className="text-center text-4xl font-bold mb-14">
          How To Get Started
        </h2>

        <div className="grid lg:grid-cols-5 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6">
            <div className="text-5xl font-bold text-blue-400">1</div>
            <h3 className="mt-4 text-xl font-semibold">Register</h3>
            <p className="mt-2 text-slate-400">
              Create your Quick Pins account using email and password.
            </p>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6">
            <div className="text-5xl font-bold text-cyan-400">2</div>
            <h3 className="mt-4 text-xl font-semibold">Google Users</h3>
            <p className="mt-2 text-slate-400">
              If you signed up using Google, you must continue using Google
              Login.
            </p>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6">
            <div className="text-5xl font-bold text-green-400">3</div>
            <h3 className="mt-4 text-xl font-semibold">Install Extension</h3>
            <p className="mt-2 text-slate-400">
              Download and install the Quick Pins browser extension.
            </p>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6">
            <div className="text-5xl font-bold text-yellow-400">4</div>
            <h3 className="mt-4 text-xl font-semibold">Verify Email</h3>
            <p className="mt-2 text-slate-400">
              Login with your registered email. An OTP will be sent for
              verification.
            </p>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6">
            <div className="text-5xl font-bold text-purple-400">5</div>
            <h3 className="mt-4 text-xl font-semibold">Start Saving</h3>
            <p className="mt-2 text-slate-400">
              Save pins from the extension popup or browser context menu.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <h2 className="text-center text-4xl font-bold mb-14">
          Save Content Instantly
        </h2>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-8">
            <h3 className="text-2xl font-semibold mb-4">Extension Popup</h3>

            <p className="text-slate-400">
              Open the Quick Pins extension and save the current webpage with a
              single click.
            </p>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-8">
            <h3 className="text-2xl font-semibold mb-4">
              Browser Context Menu
            </h3>

            <p className="text-slate-400">
              Right-click anywhere on a webpage and save useful content directly
              to your collection.
            </p>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-8">
            <h3 className="text-2xl font-semibold mb-4">Powerful Dashboard</h3>

            <p className="text-slate-400">
              Search, organize, view and manage all saved pins from your
              dashboard.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
