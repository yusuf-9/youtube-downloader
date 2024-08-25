import React, { useCallback, useState } from "react";

// services
import axiosService from "@/common/services/axios";

// constants
import { REQUEST_STATES } from "../constants";

// services
import formatsAPI from "../services/formats";

// types
import {
  FetchMetaDataResponse,
  Format,
  MetaData,
  PollVideoStatusResponse,
  RegisterVideoRequestResponse,
} from "../types";
import usePolling from "@/common/hooks/usePolling";

type Keys = keyof typeof REQUEST_STATES;
type values = (typeof REQUEST_STATES)[Keys];

function useVideoDownload() {
  // state ---------------------------------------------------------------------------------------------------------

  const [requestRegistrationError, setRequestRegistrationError] = useState("");
  const [requestState, setRequestState] = useState<{
    id: string;
    status: values | "";
    metaData: MetaData | null;
  }>({
    id: "",
    status: "",
    metaData: null,
  });
  const [selectedFormat, setSelectedFormat] = useState<Format | null>(null);

  // event handlers ------------------------------------------------------------------------------------------------

  const handleRegisterVideoDownload = useCallback(async (videoUrl: string) => {
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
      const response = await axiosService.get<FetchMetaDataResponse>(`/${requestState.id}/meta-data`);
      setRequestState(prev => ({
        ...prev,
        status: REQUEST_STATES.AWAITING_FORMAT,
        metaData: {
          ...response?.data?.data,
          formats: formatsAPI.formatFormatOptions(response?.data?.data?.formats),
        },
      }));
    } catch (error) {
      if (axiosService.isAxiosError(error)) {
        return setRequestRegistrationError(error?.message);
      }
      console.error(error);
      setRequestRegistrationError("Something went wrong.. Please try again :-(");
    }
  }, [requestState.id]);

  const handleRegisterVideoFormat = useCallback(
    async (videoUrl: string) => {
      setRequestState(prev => ({
        ...prev,
        status: REQUEST_STATES.REGISTERING_FORMAT,
      }));

      try {
        const response = await axiosService.post<RegisterVideoRequestResponse>("/register-format", {
          id: requestState.id,
          format: selectedFormat?.id,
        });
        setRequestState(prev => ({
          ...prev,
          status: REQUEST_STATES.DOWNLOADING,
        }));
      } catch (error) {
        if (axiosService.isAxiosError(error)) {
          return setRequestRegistrationError(error?.message);
        }
        console.error(error);
        setRequestRegistrationError("Something went wrong.. Please try again :-(");
      }
    },
    [requestState.id, selectedFormat?.id]
  );

  const handleDownloadVideo = useCallback((link: string) => {
    const a = document.createElement("a");
    a.href = link;
    a.download = requestState.metaData?.title! + link?.split(".")?.[1];
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [requestState.metaData?.title])

  // polling callbacks ------------------------------------------------------------------------------

  const videoMetadataPollingCallback = useCallback(
    (data: PollVideoStatusResponse) => {
      if (data?.status === "awaiting_format" && requestState.status === REQUEST_STATES.PROCESSING) {
        setRequestState(prev => ({
          ...prev,
          status: REQUEST_STATES.FETCHING_DETAILS,
        }));
        handleFetchVideoMetadata();
      }
    },
    [handleFetchVideoMetadata, requestState.status]
  );

  const videoDownloadPollingCallbacks = useCallback(
    (data: PollVideoStatusResponse) => {
      if (data?.status === "finished" && requestState.status === REQUEST_STATES.DOWNLOADING) {
        setRequestState(prev => ({
          ...prev,
          status: REQUEST_STATES.FINISHED,
        }));
        if(data?.data) handleDownloadVideo(data.data);
      }
    },
    [handleDownloadVideo, requestState.status]
  );

  const pollingErrorCallback = useCallback((error: unknown) => {
    if (axiosService.isAxiosError(error)) {
      return setRequestRegistrationError(error?.message);
    }

    setRequestRegistrationError("Uh oh, Something went wrong...");
  }, []);

  // effects ----------------------------------------------------------------------------------------

  usePolling<PollVideoStatusResponse>(
    `/${requestState.id}/status`,
    requestState.status === REQUEST_STATES.PROCESSING ? videoMetadataPollingCallback : videoDownloadPollingCallbacks,
    pollingErrorCallback,
    Boolean(
      !requestRegistrationError &&
        requestState.id &&
        (requestState.status === REQUEST_STATES.PROCESSING || requestState.status === REQUEST_STATES.DOWNLOADING)
    ),
    1000
  );

  // return ------------------------------------------------------------------------------------------

  return {
    handleRegisterVideoDownload,
    requestError: requestRegistrationError,
    requestId: requestState?.id,
    requestStatus: requestState?.status,
    requestMetaData: requestState?.metaData,
    selectedFormat,
    setSelectedFormat,
    handleRegisterVideoFormat,
  };
}

export default useVideoDownload;
