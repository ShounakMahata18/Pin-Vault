import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import Loading from "../components/Loading";

const backend_URL =
  import.meta.env.VITE_REACT_APP_BACKEND_URL || "http://localhost:5000";

const EmailVerification = () => {
  const [successMesaage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const params = useParams();

  async function verifyUser() {
    try {
      const { data } = await axios.post(
        `${backend_URL}/api/auth/verify-email/${params.token}`,
      );

      setSuccessMessage(data.message);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    verifyUser();
  }, []);
  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <div className="w-50 m-auto mt-48">
          {successMesaage && (
            <p className="text-green-500 text-2xl">{successMesaage}</p>
          )}
          {errorMessage && (
            <p className="text-red-500 text-2xl">{errorMessage}</p>
          )}
        </div>
      )}
    </>
  );
};

export default EmailVerification;
