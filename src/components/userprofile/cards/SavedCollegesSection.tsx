"use client";

import React from "react";
import {
  Card,
  Avatar,
  Button,
  Tag,
  Segmented,
  List,
  Empty,
  Row,
  Col,
  Space,
} from "antd";
import {
  GlobalOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  DeleteOutlined,
  HeartFilled,
} from "@ant-design/icons";
import { University } from "../../../types/profile";

interface SavedCollegesSectionProps {
  savedColleges: University[];
  view: "Grid" | "List";
  onViewChange: (view: "Grid" | "List") => void;
  preferredStates: string[];
  onQuickView: (uni: University) => void;
  onRemoveSaved: (id: string, name: string) => void;
}

export default function SavedCollegesSection({
  savedColleges,
  view,
  onViewChange,
  preferredStates,
  onQuickView,
  onRemoveSaved,
}: SavedCollegesSectionProps) {
  return (
    <Card
      id="saved_colleges_section"
      title={
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-1 gap-2">
          <Space>
            <HeartFilled className="text-red-500" />
            <span className="font-bold">
              Saved Colleges ({savedColleges.length})
            </span>
          </Space>

          {/* Grid/List segment switch */}
          <Segmented
            options={[
              { label: "Grid", value: "Grid", icon: <AppstoreOutlined /> },
              { label: "List", value: "List", icon: <UnorderedListOutlined /> },
            ]}
            value={view}
            onChange={(val: string) => onViewChange(val as "Grid" | "List")}
          />
        </div>
      }
      variant="borderless"
      className="shadow-md rounded-2xl border border-neutral-100"
    >
      {savedColleges.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div className="space-y-2">
              <span className="text-sm font-semibold text-neutral-500 block">
                Your saved list is empty
              </span>
              <span className="text-xs text-neutral-400 block max-w-sm mx-auto">
                Explore courses and universities to add them to your portal
                saved bookmarks directory.
              </span>
            </div>
          }
        />
      ) : view === "Grid" ? (
        /* Grid View mode matching college style */
        <Row gutter={[20, 20]}>
          {savedColleges.map((uni) => {
            const matchesPrefer = preferredStates.includes(uni.state);

            return (
              <Col xs={24} sm={12} md={8} lg={6} key={uni.id}>
                <Card
                  hoverable
                  variant="outlined"
                  className="overflow-hidden rounded-2xl h-full border-neutral-150 shadow-xs flex flex-col justify-between"
                  styles={{
                    body: {
                      padding: "16px",
                      flex: "1",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    },
                  }}
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide">
                        Rank #{uni.ranking} • {uni.type}
                      </span>
                      {matchesPrefer && (
                        <Tag
                          color="cyan"
                          style={{ borderRadius: "4px", fontSize: "10px" }}
                        >
                          Preferred State
                        </Tag>
                      )}
                    </div>

                    <h4 className="text-sm font-extrabold text-neutral-800 tracking-tight leading-snug line-clamp-1">
                      {uni.name}
                    </h4>
                    <p className="text-xs text-neutral-400 flex items-center gap-1.5 mt-0.5 font-medium">
                      <GlobalOutlined />
                      {uni.city}, {uni.state}
                    </p>

                    <div className="bg-neutral-50 rounded-xl p-2.5 mt-3 space-y-1.5 text-xs text-neutral-600">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Tuition Fee:</span>
                        <span className="font-semibold text-neutral-700">
                          ${uni.annualCost.toLocaleString()}/yr
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">
                          Acceptance Rate:
                        </span>
                        <span className="font-semibold text-neutral-700">
                          {uni.acceptanceRate}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 pt-3 border-t border-neutral-100 w-full">
                    <Button
                      type="primary"
                      ghost
                      size="small"
                      onClick={() => onQuickView(uni)}
                      style={{ flex: "1", borderRadius: "6px" }}
                    >
                      Quick View
                    </Button>
                    <Button
                      danger
                      type="text"
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => onRemoveSaved(uni.id, uni.name)}
                      style={{ borderRadius: "6px" }}
                    />
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      ) : (
        /* List View mode matching standard AntD List */
        <List
          itemLayout="horizontal"
          dataSource={savedColleges}
          renderItem={(uni: University) => (
            <List.Item
              actions={[
                <Button
                  type="link"
                  key="view"
                  onClick={() => onQuickView(uni)}
                  style={{ fontWeight: 600 }}
                >
                  Quick View
                </Button>,
                <Button
                  type="text"
                  danger
                  key="remove"
                  icon={<DeleteOutlined />}
                  onClick={() => onRemoveSaved(uni.id, uni.name)}
                >
                  Remove From list
                </Button>,
              ]}
              className="hover:bg-neutral-50 px-4 rounded-xl border-b border-neutral-100 transition-colors"
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    style={{ backgroundColor: "#1890ff", fontWeight: "bold" }}
                  >
                    {uni.name.substring(0, 2)}
                  </Avatar>
                }
                title={
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-neutral-800">
                      {uni.name}
                    </span>
                    <Tag
                      color="gold"
                      style={{ fontSize: "9px", borderRadius: "4px" }}
                    >
                      Rank #{uni.ranking}
                    </Tag>
                    <span className="text-xs text-neutral-400 font-medium">
                      ({uni.type} Institution)
                    </span>
                  </div>
                }
                description={
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500 pt-0.5">
                    <span className="flex items-center gap-1">
                      <GlobalOutlined />
                      {uni.city}, {uni.state}
                    </span>
                    <span>•</span>
                    <span>
                      Annual Cost:{" "}
                      <b className="text-neutral-700">
                        ${uni.annualCost.toLocaleString()}/yr
                      </b>
                    </span>
                    <span>•</span>
                    <span>
                      Acceptable Gates:{" "}
                      <b className="text-neutral-700">
                        {uni.acceptanceRate}% Rate
                      </b>
                    </span>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Card>
  );
}
