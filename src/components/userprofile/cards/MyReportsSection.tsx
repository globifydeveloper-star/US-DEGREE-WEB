"use client";

import React, { useEffect, useState } from "react";
import { Card, Table, Tag, Button, Empty, Alert, Space, message } from "antd";
import { FileTextOutlined, DownloadOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useRouter } from "next/navigation";
import { fetchReports, fetchReport, ReportSummary } from "@/lib/auth/api";

const PAGE_SIZE = 10;

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// Matches the filename the backend serves via Content-Disposition on
// GET /report/:reportId/download (see report.ts: `report-${reportId}.pdf`).
function pdfNameFor(report: ReportSummary): string {
  return `report-${report.reportId}.pdf`;
}

export default function MyReportsSection() {
  const router = useRouter();
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchReports(page, PAGE_SIZE);
        setReports(data.reports);
        setTotal(data.total);
      } catch (err) {
        console.error("Failed to load report history:", err);
        setError("Could not load your reports. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, [page, retryToken]);

  // Signed download URLs expire in 10-15 minutes, so always fetch a fresh one
  // right before opening it rather than trusting whatever the list returned.
  const handleDownload = async (reportId: string) => {
    setDownloadingId(reportId);
    try {
      const detail = await fetchReport(reportId);
      const win = window.open(detail.downloadUrl, "_blank", "noopener,noreferrer");
      if (!win) message.error("Please allow pop-ups to download the report.");
    } catch (err) {
      console.error("Failed to get download link:", err);
      message.error("Could not download this report. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  const columns: ColumnsType<ReportSummary> = [
    {
      title: "No.",
      key: "index",
      width: 56,
      render: (_value, _record, index) => (page - 1) * PAGE_SIZE + index + 1,
    },
    {
      title: "Created Date",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 190,
      render: (value: string) => (
        <span className="whitespace-nowrap">{formatDateTime(value)}</span>
      ),
    },
    {
      title: "Compared Colleges",
      key: "colleges",
      width: 260,
      render: (_value, record) => (
        <div className="flex flex-wrap gap-1.5">
          {record.colleges.map((college, index) => (
            <Tag
              key={`${college.unitid}-${index}`}
              className="rounded-full font-medium text-xs px-2.5 py-0.5"
            >
              {college.name}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: "Report",
      key: "report",
      width: 200,
      render: (_value, record) => (
        <span className="font-semibold text-neutral-700 break-all">
          {pdfNameFor(record)}
        </span>
      ),
    },
    {
      title: "",
      key: "download",
      width: 140,
      render: (_value, record) => (
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          loading={downloadingId === record.reportId}
          onClick={() => handleDownload(record.reportId)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-none font-bold rounded-xl whitespace-nowrap"
        >
          Download
        </Button>
      ),
    },
  ];

  return (
    <Card
      id="reports_section"
      title={
        <div className="flex items-center gap-2 py-1">
          <FileTextOutlined className="text-[#3F51B5]" />
          <span className="font-bold">My Reports</span>
        </div>
      }
      variant="borderless"
      className="shadow-md rounded-2xl border border-neutral-100"
    >
      {error ? (
        <Alert
          type="error"
          showIcon
          title="Something went wrong"
          description={error}
          action={
            <Button
              size="small"
              danger
              onClick={() => setRetryToken((n) => n + 1)}
            >
              Retry
            </Button>
          }
        />
      ) : (
        <Table<ReportSummary>
          rowKey="reportId"
          columns={columns}
          dataSource={reports}
          loading={loading}
          scroll={{ x: 800 }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span className="text-sm font-semibold text-neutral-500">
                    No reports have generated yet.
                  </span>
                }
              >
                <Space>
                  <Button
                    type="primary"
                    onClick={() => router.push("/compare")}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-none font-bold rounded-xl"
                  >
                    Compare colleges to generate one
                  </Button>
                </Space>
              </Empty>
            ),
          }}
          pagination={{
            current: page,
            pageSize: PAGE_SIZE,
            total,
            onChange: setPage,
            showSizeChanger: false,
            responsive: true,
          }}
        />
      )}
    </Card>
  );
}
