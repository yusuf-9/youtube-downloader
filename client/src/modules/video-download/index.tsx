"use client";

import React from "react";

// components
import VideoUrlInput from "@/common/components/url-input";
import Loader from "@/common/components/ui/loader";

// hooks
import useVideDownload from "./hooks/useVideoDownload";

// constants
import { REQUEST_STATES } from "./constants";

type Props = {};

function VideoDownloadModule(props: Props) {
  const { handleDownloadVideo, requestStatus, requestError, requestId, requestMetaData } = useVideDownload();

  const isRequestLoading =
    requestStatus === REQUEST_STATES.REGISTERING_REQUEST ||
    requestStatus === REQUEST_STATES.PROCESSING ||
    requestStatus === REQUEST_STATES.FETCHING_DETAILS;

  console.log({
    requestId,
    requestError,
    requestMetaData,
    requestStatus,
  });

  return (
    <div className="flex flex-col gap-4">
      <VideoUrlInput onDownload={handleDownloadVideo} />
      {isRequestLoading && (
        <div className="flex justify-center items-center gap-2">
          <Loader />
          <span className="text-sm text-primary-main font-medium">{requestStatus}...</span>
        </div>
      )}
    </div>
  );
}

export default VideoDownloadModule;
