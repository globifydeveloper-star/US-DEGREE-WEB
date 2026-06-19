"use client";

import React from "react";
import { Modal, Form, Input, Button, Space } from "antd";
import { LockOutlined } from "@ant-design/icons";

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => void | Promise<void>;
}

export default function ChangePasswordModal({
  open,
  onClose,
  onSubmit,
}: ChangePasswordModalProps) {
  const [form] = Form.useForm();

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={
        <Space>
          <LockOutlined className="text-blue-500" />
          <span className="font-extrabold">Change Account Password</span>
        </Space>
      }
      open={open}
      onCancel={handleClose}
      footer={null}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={onSubmit} className="pt-4">
        <Form.Item
          name="currentPassword"
          label="Current Password"
          rules={[
            { required: true, message: "Please enter your current password" },
          ]}
        >
          <Input.Password prefix={<LockOutlined />} />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label="New Password"
          rules={[
            { required: true, message: "Strong password is required" },
            { min: 8, message: "Password must be at least 8 characters long" },
          ]}
        >
          <Input.Password prefix={<LockOutlined />} />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Confirm New Password"
          dependencies={["newPassword"]}
          rules={[
            { required: true, message: "Please confirm password" },
            ({
              getFieldValue,
            }: {
              getFieldValue: (name: string) => unknown;
            }) => ({
              validator(_: unknown, value: unknown) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("The passwords that you entered do not match!"),
                );
              },
            }),
          ]}
        >
          <Input.Password prefix={<LockOutlined />} />
        </Form.Item>

        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="primary" htmlType="submit">
            Update Password
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
