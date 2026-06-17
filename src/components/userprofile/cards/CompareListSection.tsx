"use client";

import React from "react";
import { Card, Button, Empty, Row, Col, Space } from "antd";
import { SyncOutlined } from "@ant-design/icons";
import { University } from "../../../types/profile";

interface CompareListSectionProps {
  compareList: University[];
  onToggleCompare: (uni: University) => void;
  onClearAll: () => void;
  onCompareNow: () => void;
}

export default function CompareListSection({
  compareList,
  onToggleCompare,
  onClearAll,
  onCompareNow,
}: CompareListSectionProps) {
  return (
    <Card
      id="colleges_compare_section"
      title={
        <div className="flex items-center justify-between py-1">
          <Space>
            <SyncOutlined className="text-blue-500" />
            <span className="font-bold">Colleges Selected for Comparison</span>
          </Space>
          {compareList.length > 0 && (
            <Button danger type="text" size="small" onClick={onClearAll}>
              Clear Compare Bucket
            </Button>
          )}
        </div>
      }
      bordered={false}
      className="shadow-md rounded-2xl border border-neutral-100 bg-linear-to-b from-white to-neutral-50/20"
    >
      {compareList.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div className="space-y-1.5">
              <span className="text-sm font-semibold text-neutral-500 block">
                No Colleges selected for active comparison
              </span>
              <span className="text-xs text-neutral-400 block max-w-sm mx-auto">
                Click the Sync icon or checkbox on college search entries to
                load colleges into this comparison matrix view.
              </span>
            </div>
          }
        />
      ) : (
        <div className="space-y-6">
          <Row gutter={[16, 16]}>
            {compareList.map((uni) => (
              <Col xs={24} sm={12} md={6} key={uni.id}>
                <Card
                  size="small"
                  bordered
                  className="border-neutral-200 shadow-xxs rounded-xl relative"
                >
                  <button
                    className="absolute top-2 right-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-full h-5 w-5 flex items-center justify-center transition-colors"
                    onClick={() => onToggleCompare(uni)}
                  >
                    ×
                  </button>
                  <div className="space-y-1 pr-6 pt-1">
                    <h5 className="text-xs font-bold text-neutral-800 truncate">
                      {uni.name}
                    </h5>
                    <span className="text-[10px] text-neutral-400 font-medium">
                      {uni.city}, {uni.state}
                    </span>
                    <p className="text-xs font-extrabold text-blue-600 block mt-2">
                      Rank #{uni.ranking}
                    </p>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          <div className="flex items-center justify-between bg-blue-50/50 rounded-2xl p-4 border border-blue-100/50">
            <span className="text-xs text-neutral-600 leading-relaxed font-semibold">
              🎓 Evaluate financial and selectively matrices side by side in the
              comparison matrix tool below.
            </span>
            <Button
              type="primary"
              disabled={compareList.length < 2}
              onClick={onCompareNow}
              style={{ borderRadius: "8px" }}
            >
              Compare Now ({compareList.length})
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
