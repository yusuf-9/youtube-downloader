import React, { useCallback, useState } from "react";

// services
import axiosService from "@/common/services/axios";

// constants
import { REQUEST_STATES } from "../constants";

// services
import formatsAPI from "../services/formats";

// hooks
import usePolling from "@/common/hooks/usePolling";

// types
import { FetchMetaDataResponse, MetaData, PollVideoStatusResponse, RegisterVideoRequestResponse } from "../types";

type Keys = keyof typeof REQUEST_STATES;
type values = (typeof REQUEST_STATES)[Keys];

export type SelectedFormatState = Record<
  "video" | "audio",
  {
    extension: string;
    resolution: string;
  }
>;

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
  const [selectedFormat, setSelectedFormat] = useState<SelectedFormatState>({
    video: { extension: "", resolution: "" },
    audio: { extension: "", resolution: "" },
  });

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
        metaData: response?.data?.data,
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

      const format = Object.values(selectedFormat).find(format => Boolean(format.resolution));
      if (!format) {
        return setRequestRegistrationError("Please select a video format.");
      }

      try {
        await axiosService.post<RegisterVideoRequestResponse>("/register-format", {
          id: requestState.id,
          format: {
            extension: format.extension,
            resolution: format.resolution,
          },
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
    [requestState.id, selectedFormat]
  );

  const handleDownloadVideo = useCallback(
    (link: string) => {
      const a = document.createElement("a");
      a.href = link;
      a.download = requestState.metaData?.title! + link?.split(".")?.[1];
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },
    [requestState.metaData?.title]
  );

  const handleSelectFormatResolution = useCallback((key: "video" | "audio", resolution: string) => {
    setSelectedFormat(prev => ({
      ...Object.keys(prev).reduce(
        (acc, formatKey) => {
          acc[formatKey as keyof SelectedFormatState] = {
            ...prev[formatKey as keyof SelectedFormatState],
            resolution: "",
          };
          return acc;
        },
        {
          video: {
            extension: "",
            resolution: "",
          },
          audio: {
            extension: "",
            resolution: "",
          },
        }
      ),
      [key]: {
        ...prev[key],
        resolution,
      },
    }));
  }, []);

  const handleSelectFormatExtension = useCallback((key: "video" | "audio", extension: string) => {
    setSelectedFormat(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        extension,
      },
    }));
  }, []);

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
        if (data?.data) handleDownloadVideo(data.data);
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
    handleSelectFormatExtension,
    handleSelectFormatResolution,
  };
}

export default useVideoDownload;
