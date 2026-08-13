"use client";

import { Dropdown, Avatar } from "antd";
import type { MenuProps } from "antd";

interface UserMenuProps {
  items: MenuProps["items"];
  avatarInitial: string;
  firstName: string;
}

export default function UserMenu({
  items,
  avatarInitial,
  firstName,
}: UserMenuProps) {
  return (
    <Dropdown
      menu={{ items }}
      trigger={["click"]}
      placement="bottomRight"
    >
      <button
        type="button"
        className="hidden sm:inline-flex items-center gap-2.5 rounded-full border border-slate-200 hover:bg-slate-50 pl-2 pr-4 py-1.5 transition-colors cursor-pointer"
      >
        <Avatar
          size={32}
          style={{ backgroundColor: "#3b5bdb", fontWeight: 600 }}
        >
          {avatarInitial}
        </Avatar>
        <span className="text-[15px] font-semibold text-slate-600">
          Hi, {firstName}
        </span>
      </button>
    </Dropdown>
  );
}
