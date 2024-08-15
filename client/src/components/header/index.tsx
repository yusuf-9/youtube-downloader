import React from "react";

function Header(props) {
  return (
    <div className="container flex flex-col">
      <div className="flex justify-between items-center">
        <div>Logo</div>
      </div>
      <div className="flex justify-between gap-4">
        <div>Menu 1</div>
        <div>Menu 2</div>
        <div>Menu 3</div>
        <div>Menu 4</div>
        <div>Menu 5</div>
      </div>
    </div>
  );
}

export default Header;
