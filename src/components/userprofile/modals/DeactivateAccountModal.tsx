"use client";

import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Checkbox,
  Alert,
  Button,
  Space,
  message,
} from "antd";
import { WarningOutlined } from "@ant-design/icons";
import { DEACTIVATION_REASONS } from "../../../data/mockProfile";

interface DeactivateAccountModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeactivateAccountModal({
  open,
  onClose,
  onConfirm,
}: DeactivateAccountModalProps) {
  const [form] = Form.useForm();
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");
  const [understandDeactivateCheckbox, setUnderstandDeactivateCheckbox] =
    useState(false);
  const [deactivateReasonCode, setDeactivateReasonCode] = useState<string>("");

  const resetLocalState = () => {
    setDeleteConfirmInput("");
    setUnderstandDeactivateCheckbox(false);
    setDeactivateReasonCode("");
    form.resetFields();
  };

  const handleClose = () => {
    resetLocalState();
    onClose();
  };

  const handleConfirm = () => {
    if (deleteConfirmInput !== "DELETE") {
      message.error("Please type 'DELETE' exactly to confirm your choice.");
      return;
    }
    onConfirm();
    resetLocalState();
  };

  return (
    <Modal
      title={
        <Space>
          <WarningOutlined className="text-red-500" />
          <span className="font-extrabold text-red-600">
            Close Account & Erase Records
          </span>
        </Space>
      }
      open={open}
      onCancel={handleClose}
      footer={null}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" className="pt-4 space-y-4">
        <Alert
          message="This decision triggers irreversible data erasure. There is no grace period for restoration."
          type="warning"
          showIcon
          className="text-xs rounded-xl"
        />

        <Form.Item
          name="deactivationReason"
          label="Required: Please let us know why you are choosing to deactivate"
          rules={[
            { required: true, message: "Please select a deactivation reason" },
          ]}
        >
          <Select
            options={DEACTIVATION_REASONS}
            placeholder="Select a reason"
            onChange={(val: string) => setDeactivateReasonCode(val)}
          />
        </Form.Item>

        {deactivateReasonCode === "5" && (
          <Form.Item
            name="otherReason"
            label="Describe other reasons"
            rules={[
              {
                required: true,
                message: "Please enter details for validation",
              },
            ]}
          >
            <Input.TextArea placeholder="Type reason detail here..." rows={3} />
          </Form.Item>
        )}

        <Form.Item
          name="improvement"
          label="What could we have improved? (Optional)"
        >
          <Input.TextArea
            placeholder="Feedbacks helps us build better unbiased tools..."
            rows={2}
          />
        </Form.Item>

        <Form.Item
          name="understandConfirm"
          valuePropName="checked"
          rules={[
            {
              validator: (_: unknown, value: unknown) =>
                value
                  ? Promise.resolve()
                  : Promise.reject(
                      new Error(
                        "You must confirm awareness checkbox to proceed",
                      ),
                    ),
            },
          ]}
        >
          <Checkbox
            checked={understandDeactivateCheckbox}
            onChange={(e: { target: { checked: boolean } }) =>
              setUnderstandDeactivateCheckbox(e.target.checked)
            }
            className="text-xs text-neutral-600 leading-snug"
          >
            I understand that my account settings, lists, and matches
            calculations may be permanently removed.
          </Checkbox>
        </Form.Item>

        <div className="bg-neutral-50/70 p-4 rounded-2xl border border-neutral-150 space-y-3">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest block">
            Erase Protection: String Verification
          </span>
          <span className="text-xs text-neutral-600 block">
            Type the word{" "}
            <b className="text-red-600 font-extrabold select-all">DELETE</b>{" "}
            below to confirm you consent to the deletion:
          </span>
          <Input
            placeholder="Type DELETE"
            value={deleteConfirmInput}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setDeleteConfirmInput(e.target.value)
            }
            className="font-bold uppercase tracking-wider text-center py-2 text-sm"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            danger
            type="primary"
            disabled={
              deleteConfirmInput !== "DELETE" || !understandDeactivateCheckbox
            }
            onClick={handleConfirm}
            style={{ borderRadius: "8px" }}
          >
            Deactivate My Account
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
