import type { MenuProps } from "antd";
import type { useRouter } from "next/navigation";
import {
  UserOutlined,
  HeartFilled,
  SyncOutlined,
  SettingOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

type AppRouter = ReturnType<typeof useRouter>;

// User dropdown shown when clicking the avatar / "Hi, {name}" greeting.
export function buildUserMenuItems(
  router: AppRouter,
  onSignOut: () => void,
): MenuProps["items"] {
  return [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "My Profile",
      onClick: () => router.push("/profile"),
    },
    {
      key: "saved",
      icon: <HeartFilled />,
      label: "Saved Colleges",
      onClick: () => router.push("/profile#saved_colleges_section"),
    },
    {
      key: "compare",
      icon: <SyncOutlined />,
      label: "Compare List",
      onClick: () => router.push("/compare"),
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Account Settings",
      onClick: () => router.push("/profile"),
    },
    { type: "divider" },
    {
      key: "signout",
      icon: <LogoutOutlined />,
      label: "Sign Out",
      danger: true,
      onClick: onSignOut,
    },
  ];
}
