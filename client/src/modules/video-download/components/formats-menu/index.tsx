import React, { useMemo } from "react";
import { Format, MetaData } from "../../types";
import clsx from "clsx";

type Props = {
  formats: MetaData["formats"];
  selectedFormatId: string;
  onFormatSelect: (format: Format) => void;
};

export default function FormatsMenu(props: Props) {
  const { formats, onFormatSelect, selectedFormatId } = props;

  const formatCategories = Object.keys(formats)?.length 

  const formatOptions = useMemo(() => {
    return Object.entries(formats).map(([formatExtension, formatData], index) => (
      <div
        className={clsx(
          "col-span-1 flex flex-col border-primary-light px-1",
          (index < formatCategories - 1) && 'border-r'
        )}
        key={index}
      >
        <h3 className="uppercase text-sm font-medium text-center text-primary-main">{formatExtension}</h3>
        {formatData?.map((formatData, idx) => (
          <div
            key={idx}
            className={clsx(
              "flex justify-between items-center group cursor-pointer rounded-md py-0.5 px-2",
              formatData.id === selectedFormatId ? "bg-primary-light text-white" : "text-primary-dark"
            )}
            onClick={() => onFormatSelect(formatData)}
          >
            <h5 className="text-xs font-normal group-hover:underline">{formatData?.resolution}</h5>
            <h5 className="text-xs font-normal group-hover:underline">{formatData?.fileSize}</h5>
          </div>
        ))}
      </div>
    ));
  }, [formatCategories, formats, onFormatSelect, selectedFormatId]);

  return (
    <div
      id="mega-menu-dropdown"
      className={clsx(
        "absolute w-full left-1/2 top-full 2 -translate-x-1/2 z-10 bg-white border border-primary-light rounded-lg shadow-md p-4",
        `grid grid-cols-4`
      )}
    >
      {formatOptions}
    </div>
  );
}
