"use client";

import React from "react";
import { Modal, Form, Input, Button, Space, Alert } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";

interface ChangeEmailModalProps {
  open: boolean;
  onClose: () => void;
  currentEmail: string;
  onSubmit: (values: {
    newEmail: string;
    currentPassword: string;
  }) => void | Promise<void>;
}

export default function ChangeEmailModal({
  open,
  onClose,
  currentEmail,
  onSubmit,
}: ChangeEmailModalProps) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = React.useState(false);

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleFinish = async (values: {
    newEmail: string;
    currentPassword: string;
  }) => {
    setSubmitting(true);
    try {
      await onSubmit(values);
      form.resetFields();
    } finally {
      setSubmitting(false);
    }
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
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        className="pt-4"
      >
        <Alert
          type="info"
          showIcon
          className="text-xs rounded-xl mb-4"
          title="We'll email a verification link to your new address. Your email changes only after you click that link — and is reflected here on your next sign-in."
        />

        <Form.Item label="Current Email Address">
          <Input prefix={<MailOutlined />} value={currentEmail} disabled />
        </Form.Item>

        <Form.Item
          name="newEmail"
          label="New Email Address"
          rules={[
            { required: true, message: "New email is required" },
            { type: "email", message: "Enter a valid email address format" },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="you@example.com" />
        </Form.Item>

        <Form.Item
          name="currentPassword"
          label="Current Password"
          rules={[
            { required: true, message: "Please enter your current password" },
          ]}
        >
          <Input.Password prefix={<LockOutlined />} />
        </Form.Item>

        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={submitting}>
            Send Verification Link
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
