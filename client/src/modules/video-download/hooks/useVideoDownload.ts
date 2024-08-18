import React, { useCallback, useState } from "react";

// services
import axiosService from "@/common/services/axios";

// constants
import { REQUEST_STATES } from "../constants";

// types
import { FetchMetaDataResponse, PollVideoStatusResponse, RegisterVideoRequestResponse } from "../types";
import usePolling from "@/common/hooks/usePolling";

type Keys = keyof typeof REQUEST_STATES;
type values = (typeof REQUEST_STATES)[Keys];

function useVideoDownload() {
  const [requestRegistrationError, setRequestRegistrationError] = useState("");
  const [requestState, setRequestState] = useState<{
    id: string;
    status: values | "";
    metaData: Record<string, any> | null;
  }>({
    id: "",
    status: "",
    metaData: null,
  });

  // event handlers
  const handleDownloadVideo = useCallback(async (videoUrl: string) => {
    setRequestState(prev => ({
      ...prev,
      status: REQUEST_STATES.REGISTERING_REQUEST,
    }));

    try {
      const response = await axiosService.post<RegisterVideoRequestResponse>("/register-request", { url: videoUrl });

      setRequestState(prev => ({
        ...prev,
        id: response.data.data,
        status: REQUEST_STATES.PROCESSING,
      }));
    } catch (error) {
      if (axiosService.isAxiosError(error)) {
        return setRequestRegistrationError(error?.message);
      }
      console.error(error);
      setRequestRegistrationError("Something went wrong.. Please try again :-(");
    }
  }, []);

  const handleFetchVideoMetadata = useCallback(async () => {
    try {
      console.log({id: requestState.id})
      const response = await axiosService.get<FetchMetaDataResponse>(`/${requestState.id}/meta-data`);
      setRequestState(prev => ({
        ...prev,
        status: REQUEST_STATES.AWAITING_FORMAT,
        metaData: response.data.data,
      }));
    } catch (error) {
      if (axiosService.isAxiosError(error)) {
        return setRequestRegistrationError(error?.message);
      }
      console.error(error);
      setRequestRegistrationError("Something went wrong.. Please try again :-(");
    }
  }, [requestState.id]);

  // polling callbacks
  const videoMetadataPollingCallback = useCallback((data: PollVideoStatusResponse) => {
    if (data?.status === "awaiting_format") {
      setRequestState(prev => ({
        ...prev,
        status: REQUEST_STATES.FETCHING_DETAILS,
      }));
      handleFetchVideoMetadata();
    }
  }, [handleFetchVideoMetadata]);

  const videoDownloadPollingCallbacks = useCallback(() => {}, []);

  const pollingErrorCallback = useCallback((error: unknown) => {
    console.error("Polling error:", error);
    if (axiosService.isAxiosError(error)) {
      return setRequestRegistrationError(error?.message);
    }

    setRequestRegistrationError("Uh oh, Something went wrong...");
  }, []);

  // polling handlers
  usePolling<PollVideoStatusResponse>(
    `/${requestState.id}/status`,
    videoMetadataPollingCallback,
    pollingErrorCallback,
    Boolean(
      !requestRegistrationError &&
        requestState.id &&
        (requestState.status === REQUEST_STATES.PROCESSING || requestState.status === REQUEST_STATES.DOWNLOADING)
    ),
    1000
  );

  return {
    handleDownloadVideo,
    requestError: requestRegistrationError,
    requestId: requestState?.id,
    requestStatus: requestState?.status,
    requestMetaData: requestState?.metaData
  };
}

export default useVideoDownload;
