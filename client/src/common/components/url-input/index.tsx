"use client";

import React, { useState } from "react";

// components
import Button from "@/common/components/ui/button";

type Props = {
  onDownload: (videoUrl: string) => void;
};

function VideoUrlInput(props: Props) {
  const { onDownload } = props;

  const [videoUrl, setVideoUrl] = useState("");

  return (
    <div className="flex items-center justify-between p-2 rounded-md bg-theme-light shadow-[rgba(0,0,15,0.1)_0px_2px_5px_2px]">
      <input
        value={videoUrl}
        onChange={e => setVideoUrl(e.target.value)}
        placeholder="Paste video link here"
        className="py-2 px-2 flex-grow outline-none border-none text-theme-contrast-main"
      />
      <Button
        onClick={() => onDownload(videoUrl)}
        text="Download"
        disabled={!videoUrl?.length}
      />
    </div>
  );
}

export default VideoUrlInput;
