import React, { useMemo } from "react";
import clsx from "clsx";

// types
import { MetaData } from "../../types";
import { SelectedFormatState } from "../../hooks/useVideoDownload";

type Props = {
  formats: MetaData["formats"];
  selectedFormat: SelectedFormatState;
  onFormatExtensionSelect: (key: "video" | "audio", extension: string) => void;
  onFormatResolutionSelect: (key: "video" | "audio", resolution: string) => void;
};

export default function FormatsMenu(props: Props) {
  const { formats, selectedFormat, onFormatExtensionSelect, onFormatResolutionSelect } = props;

  const formatCategories = Object.keys(formats)?.length;

  const formatOptions = useMemo(() => {
    return Object.entries(formats)?.map(([key, format], index) => {
      return (
        <div
          className={clsx(
            "col-span-1 flex flex-col gap-2 border-primary-light px-1",
            index < formatCategories - 1 && "border-r"
          )}
          key={index}
        >
          <select
            className="uppercase text-sm font-medium text-center text-primary-main"
            value={selectedFormat[key as keyof SelectedFormatState]?.extension}
            onChange={e => onFormatExtensionSelect(key as keyof SelectedFormatState, e.target.value)}
          >
            {selectedFormat[key as keyof SelectedFormatState]?.extension}
            {format.extensions?.map((extension, index) => (
              <option
                key={index}
                value={extension}
              >
                {extension}
              </option>
            ))}
          </select>
          <div className="flex flex-col gap-1">
            {format.resolutions?.map((resolution, idx) => (
              <h5
                key={idx}
                className={clsx(
                  "cursor-pointer rounded-md py-0.5 px-2 text-xs font-normal group-hover:underline text-center",
                  selectedFormat[key as keyof SelectedFormatState].resolution === resolution
                    ? "bg-primary-light text-white"
                    : "text-primary-dark"
                )}
                onClick={e => onFormatResolutionSelect(key as keyof SelectedFormatState, resolution)}
              >
                {resolution}
              </h5>
            ))}
          </div>
        </div>
      );
    });
  }, [formatCategories, formats, onFormatExtensionSelect, onFormatResolutionSelect, selectedFormat]);

  return (
    <div
      id="mega-menu-dropdown"
      className={clsx(
        "absolute w-full left-1/2 top-full 2 -translate-x-1/2 z-10 bg-white border border-primary-light rounded-lg shadow-md p-4",
        `grid grid-cols-2`
      )}
    >
      {formatOptions}
    </div>
  );
}
