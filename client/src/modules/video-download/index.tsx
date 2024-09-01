"use client";

import React, { useState } from "react";

// components
import Loader from "@/common/components/ui/loader";
import VideoUrlInput from "./components/url-input";
import VideoDownloadCard from "./components/video-download-card";
import FormatsMenu from "./components/formats-menu";

// hooks
import useVideoDownload from "./hooks/useVideoDownload";

// constants
import { REQUEST_STATES } from "./constants";

type Props = {};

function VideoDownloadModule(props: Props) {
  const {
    handleRegisterVideoDownload,
    requestStatus,
    requestError,
    requestMetaData,
    selectedFormat,
    handleSelectFormatExtension,
    handleSelectFormatResolution,
    handleRegisterVideoFormat
  } = useVideoDownload();

  const [formatsDropdownOpen, setFormatsDropdownOpen] = useState(false);

  const isRequestLoading =
    requestStatus === REQUEST_STATES.REGISTERING_REQUEST ||
    requestStatus === REQUEST_STATES.PROCESSING ||
    requestStatus === REQUEST_STATES.FETCHING_DETAILS;

  const allowFormatMenuRender = Boolean(requestMetaData?.formats);

  const disableDownloadAction = requestStatus === REQUEST_STATES.AWAITING_FORMAT && !selectedFormat

  return (
    <div className="flex flex-col gap-6">
      <div className="relative">
        <VideoUrlInput
          showFormatMenuTrigger={allowFormatMenuRender}
          onClickFormatMenuTrigger={() => setFormatsDropdownOpen(prev => !prev)}
          isFormatMenuOpen={formatsDropdownOpen}
          onDownload={allowFormatMenuRender ? handleRegisterVideoFormat : handleRegisterVideoDownload}
          disableDownload={disableDownloadAction}
        />
        {allowFormatMenuRender && formatsDropdownOpen && (
          <FormatsMenu
            selectedFormat={selectedFormat}
            onFormatExtensionSelect={handleSelectFormatExtension}
            onFormatResolutionSelect={handleSelectFormatResolution}
            formats={requestMetaData?.formats!}
          />
        )}
      </div>
      {isRequestLoading && (
        <div className="flex flex-col justify-center items-center gap-2">
          <Loader />
          <span className="text-sm text-primary-main font-medium">{requestStatus}...</span>
        </div>
      )}
      {!!requestMetaData && (
        <VideoDownloadCard
          title={requestMetaData?.title}
          duration={requestMetaData?.duration}
          thumbnail={requestMetaData?.thumbnail}
          link={requestMetaData?.webpage_url}
        />
      )}
    </div>
  );
}

export default VideoDownloadModule;
