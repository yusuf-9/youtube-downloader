import { useCallback, useEffect, useState } from "react";

// services
import axiosService from "@/common/services/axios";

export default function usePolling<T>(
  url: string,
  successCallback: (data: T) => void,
  errorCallback: (error: unknown) => void,
  shouldFetch = true,
  interval: number = 1000
) {
  const fetchHandler = useCallback(async (url: string) => {
    try {
      const response = await axiosService.get<T>(url);
      successCallback(response?.data);
    } catch (error) {
      errorCallback(error);
    }
  }, [errorCallback, successCallback]);

  useEffect(() => {
    if (!shouldFetch) return;

    const intervalRef = setInterval(() => fetchHandler(url), interval);

    return () => clearInterval(intervalRef);
  }, [url, interval, shouldFetch, fetchHandler]);
}
