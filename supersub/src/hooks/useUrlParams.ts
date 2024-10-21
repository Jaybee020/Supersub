import { useState, useEffect } from "react";

const useUrlParams = () => {
  const [params, setParams] = useState<Record<string, string>>({});

  useEffect(() => {
    const updateParams = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const newParams: Record<string, string> = {};
      searchParams.forEach((value, key) => {
        newParams[key] = value;
      });
      setParams(newParams);
    };

    updateParams();

    window.addEventListener("popstate", updateParams);
    return () => {
      window.removeEventListener("popstate", updateParams);
    };
  }, []);

  return params;
};

export default useUrlParams;
