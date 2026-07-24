"use client";

import { Tooltip } from "antd";
import {
  getCredentialLevelInfo,
  CREDENTIAL_LEVEL_COLOR,
  CREDENTIAL_LEVEL_COLOR_DEFAULT,
  CREDENTIAL_LEVEL_SHORT_LABEL,
} from "@/constants/credentialLevel";

interface CredentialLevelChipProps {
  credentialLevel: number | null | undefined;
  className?: string;
}

/**
 * Small pill badge showing a program/category's IPEDS credential level
 * (e.g. "Bachelor's"). Renders nothing when the level is null/unknown,
 * matching the null-handling convention used elsewhere for credential_level.
 */
export default function CredentialLevelChip({
  credentialLevel,
  className,
}: CredentialLevelChipProps) {
  const info = getCredentialLevelInfo(credentialLevel);
  if (!info || credentialLevel == null) return null;

  const label = CREDENTIAL_LEVEL_SHORT_LABEL[credentialLevel] ?? info.title;
  const colorClasses =
    CREDENTIAL_LEVEL_COLOR[credentialLevel] ?? CREDENTIAL_LEVEL_COLOR_DEFAULT;

  return (
    <Tooltip title={info.title} mouseEnterDelay={0.25} mouseLeaveDelay={0}>
      <span
        className={[
          "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide leading-none",
          colorClasses,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {label}
      </span>
    </Tooltip>
  );
}
