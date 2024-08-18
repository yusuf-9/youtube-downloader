import React from "react";

type Props = {
  highlightedTitle: string;
  description: string;
  warningText?: string;
};

function Hero(props: Props) {
  const { highlightedTitle, description, warningText } = props;

  return (
    <div className="flex flex-col gap-5 text-center">
      <div className="flex gap-2 items-center justify-center text-theme-contrast-dark text-2xl sm:text-3xl md:text-4xl font-semibold">
        <h1 className="bg-accent-main py-2 px-4 rounded-xl">{highlightedTitle}</h1>
        <h1>Downloader</h1>
      </div>
      <p className="text-theme-contrast-light text-sm w-full">{description}</p>
      {!!warningText && <p className="w-full mx-auto uppercase text-center rounded-lg bg-red-100 text-red-500 py-2 text-xs sm:text-sm font-medium">{warningText}</p>}
    </div>
  );
}

export default Hero;