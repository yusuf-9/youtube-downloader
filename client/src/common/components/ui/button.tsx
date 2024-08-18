import React from "react";

type Props = {
  disabled?: boolean;
  onClick: () => void;
  text: string;
};

function Button(props: Props) {
  const { disabled, onClick, text } = props;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-6 py-2 text-white bg-primary-main hover:bg-primary-dark rounded-md disabled:bg-primary-light"
    >
      {text}
    </button>
  );
}

export default Button;
