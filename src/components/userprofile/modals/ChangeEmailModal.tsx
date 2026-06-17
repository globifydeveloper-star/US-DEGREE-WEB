"use client";

import React, { useState } from "react";
import { Modal, Form, Input, Button, Space, message } from "antd";
import { MailOutlined } from "@ant-design/icons";

interface ChangeEmailModalProps {
  open: boolean;
  onClose: () => void;
  currentEmail: string;
  onSubmit: (values: { newEmail: string }) => void;
}

export default function ChangeEmailModal({
  open,
  onClose,
  currentEmail,
  onSubmit,
}: ChangeEmailModalProps) {
  const [form] = Form.useForm();
  const [sentEmailVerification, setSentEmailVerification] = useState(false);

  const handleClose = () => {
    setSentEmailVerification(false);
    form.resetFields();
    onClose();
  };

  const handleFinish = (values: { newEmail: string }) => {
    onSubmit(values);
    setSentEmailVerification(false);
    form.resetFields();
  };

  return (
    <Modal
      title={
        <Space>
          <MailOutlined className="text-blue-500" />
          <span className="font-extrabold">Modify Registered Email</span>
        </Space>
      }
      open={open}
      onCancel={handleClose}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        className="pt-4"
      >
        <Form.Item
          name="currentEmail"
          label="Current Email Address"
          initialValue={currentEmail}
        >
          <Input prefix={<MailOutlined />} disabled />
        </Form.Item>

        <Form.Item
          name="newEmail"
          label="New Verified Email Address"
          rules={[
            { required: true, message: "New email is required" },
            { type: "email", message: "Enter a valid email address format" },
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            onChange={() => setSentEmailVerification(false)}
          />
        </Form.Item>

        <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-100 flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-bold text-neutral-800 block">
              Verification Required
            </span>
            <span className="text-[11px] text-neutral-400 block">
              A verification code must be triggered to lock settings
            </span>
          </div>
          <Button
            size="small"
            onClick={() => {
              setSentEmailVerification(true);
              message.info(
                "A mockup OTP code '83921' generated and queued. Check logs.",
              );
            }}
          >
            {sentEmailVerification ? "Resend Code" : "Send Code"}
          </Button>
        </div>

        {sentEmailVerification && (
          <Form.Item
            name="verificationCode"
            label="Input Verification Code"
            rules={[
              { required: true, message: "Verification OTP is mandatory" },
            ]}
            help="Hint: type '83921' (generated mockup code sent for test compliance)"
          >
            <Input
              placeholder="e.g. 83921"
              maxLength={6}
              style={{
                fontWeight: "bold",
                letterSpacing: "0.2em",
                textAlign: "center",
              }}
            />
          </Form.Item>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            type="primary"
            htmlType="submit"
            disabled={!sentEmailVerification}
          >
            Authenticate & Save Email
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
