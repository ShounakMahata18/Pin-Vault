import { useEffect, useState } from "react";

const useView = (defaultView = "list") => {
  const [view, setView] = useState(
    () => localStorage.getItem("view") || defaultView,
  );

  useEffect(() => {
    localStorage.setItem("view", view);
  }, [view]);

  return {
    view,
    setView,
  };
};

export default useView;
