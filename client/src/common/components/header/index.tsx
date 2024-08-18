"use client";

import Link from "next/link";
import React from "react";
import clsx from "clsx";

// constants
import { ROUTES } from "@/common/constants";

// hooks
import { usePathname } from "next/navigation";

type Props = {};

const NAVLINK_DATA = [
  {
    label: "Video Download",
    href: ROUTES.VIDEO_DOWNLOAD,
  },
  {
    label: "Playlist Download",
    href: ROUTES.PLAYLIST_DOWNLOAD,
  },
];

function Header(props: Props) {
  const pathname = usePathname();

  return (
    <div className="shadow-[rgba(0,0,15,0.1)_0px_2px_5px_2px] z-10">
      <div className="xl:w-4/5 mx-auto flex flex-col px-4">
        <div className="flex items-center justify-between py-6 border-b">
          <h4>LOGO</h4>
          <div className="theme">THEME SWITCHER</div>
        </div>
        <div className="flex item-center justify-between py-2">
          {NAVLINK_DATA.map((linkData, index) => (
            <Link
              href={linkData.href}
              key={index}
              className={clsx(
                "px-4 py-2 rounded-md cursor-pointer",
                pathname === linkData.href ? "bg-primary-light text-primary-dark hover:text-white" : "bg-transparent hover:bg-primary-light"
              )}
            >
              {linkData?.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Header;
