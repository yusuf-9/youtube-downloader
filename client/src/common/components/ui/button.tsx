import clsx from "clsx";
import Image from "next/image";
import React from "react";

type Props = {
  disabled?: boolean;
  onClick: () => void;
  text: string;
  className?: string;
  iconPath?: string;
  iconClassName?: string;
};

function Button(props: Props) {
  const { disabled, onClick, text, className, iconClassName, iconPath } = props;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "px-6 py-2 text-white bg-primary-main hover:bg-primary-dark rounded-md disabled:bg-primary-light flex items-center justify-center gap-2",
        className
      )}
    >
      {text}
      {!!iconPath && (
        <Image
          src={iconPath}
          height={10}
          width={10}
          className={iconClassName}
          alt={text + "-icon"}
        />
      )}
    </button>
  );
}

export default Button;
