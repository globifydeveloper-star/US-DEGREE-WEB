"use client";

import React from "react";
import { Avatar, Button } from "antd";
import { DeleteOutlined, WarningOutlined } from "@ant-design/icons";

interface DangerZoneCardProps {
  onDeactivate: () => void;
}

export default function DangerZoneCard({ onDeactivate }: DangerZoneCardProps) {
  return (
    <div className="border border-red-200 bg-red-50/20 rounded-2xl p-6 sm:p-8 space-y-4">
      <div className="flex items-start gap-4">
        <Avatar
          icon={<WarningOutlined className="text-red-600" />}
          className="bg-red-50 text-red-600 flex-none"
        />
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-red-900">
            Danger Zone: Permanent Account Deactivation
          </h4>
          <p className="text-xs text-red-700 leading-relaxed max-w-2xl">
            Permanently close your neutral counselor portfolio. Once
            deactivation processing starts, listed bookmarks, active match
            alignment percentages, and test score calculations index profiles
            will be queued for absolute removal.
          </p>
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <Button
          danger
          type="primary"
          icon={<DeleteOutlined />}
          onClick={onDeactivate}
          style={{ borderRadius: "8px" }}
        >
          Deactivate Account
        </Button>
      </div>
    </div>
  );
}
