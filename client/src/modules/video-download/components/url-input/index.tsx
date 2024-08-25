"use client";

import React, { useState } from "react";

// components
import Button from "@/common/components/ui/button";

type Props = {
  onDownload: (videoUrl: string) => void;
  showFormatMenuTrigger: boolean;
  onClickFormatMenuTrigger: () => void;
  isFormatMenuOpen: boolean;
  disableDownload: boolean;
};

function VideoUrlInput(props: Props) {
  const { onDownload, showFormatMenuTrigger, onClickFormatMenuTrigger, isFormatMenuOpen, disableDownload } = props;

  const [videoUrl, setVideoUrl] = useState("");

  return (
    <div className="flex items-center justify-between p-2 rounded-md bg-theme-light bottom-shadow relative gap-2">
      <input
        value={videoUrl}
        onChange={e => setVideoUrl(e.target.value)}
        placeholder="Paste video link here"
        className="py-2 px-2 flex-grow outline-none border-none text-theme-contrast-main"
      />
      {showFormatMenuTrigger && (
        <Button
          text="formats"
          onClick={onClickFormatMenuTrigger}
          className="bg-primary-main/70"
          iconPath={isFormatMenuOpen ? "/icons/angle-up.svg" : "/icons/angle-down.svg"}
          iconClassName="h-4 w-4"
        />
      )}
      <Button
        onClick={() => onDownload(videoUrl)}
        text="Download"
        disabled={!videoUrl?.length || disableDownload}
      />
    </div>
  );
}

export default VideoUrlInput;
