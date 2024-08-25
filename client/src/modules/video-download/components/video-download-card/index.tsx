import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

// components
import Button from "@/common/components/ui/button";

// utils
import { formatDuration } from "@/common/utils";

// types
import { MetaData } from "@/modules/video-download/types";

type Props = {
  title: MetaData['title'];
  duration: MetaData['duration'];
  thumbnail: MetaData['thumbnail'];
  link: MetaData['webpage_url'];
};

export default function VideoDownloadCard(props: Props) {
  const { duration, title, thumbnail, link } = props;


  return (
    <div className="flex flex-col gap-4 p-4 rounded-xl animate-fade-in bg-white bottom-shadow">
      <div className="flex items-stretch gap-3">
        <Image
          src={thumbnail}
          width={300}
          height={200}
          className="h-52 w-auto rounded-xl"
          priority
          alt="video thumbnail"
        />
        <div className="flex-grow flex flex-col gap-2">
          <Link
            href={link}
            target="_blank"
            className="text-primary-main underline text-lg font-medium capitalize"
          >
            {title}
          </Link>
          <p className="text-theme-contrast-main text-sm">
            Duration: <b>{formatDuration(duration)}</b>
          </p>
        </div>
      </div>
    </div>
  );
}
