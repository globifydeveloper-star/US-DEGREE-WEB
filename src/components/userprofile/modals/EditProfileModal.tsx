"use client";

import React from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Row,
  Col,
  Space,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { StudentProfile } from "../../../types/profile";
import { PROGRAM_OPTIONS } from "../../../data/profileOptions";
import { useStates, useDegreeLevels } from "../../../lib/referenceData";

type ProfileFormValues = Omit<StudentProfile, "createdDate" | "lastLogin">;

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  profile: StudentProfile;
  onSave: (values: ProfileFormValues) => void;
}

export default function EditProfileModal({
  open,
  onClose,
  profile,
  onSave,
}: EditProfileModalProps) {
  const [form] = Form.useForm();

  // Canonical reference data sourced from the backend (never hardcoded).
  const { states, loading: statesLoading } = useStates();
  const { degreeLevels, loading: degreeLevelsLoading } = useDegreeLevels();

  return (
    <Modal
      title={
        <Space>
          <UserOutlined className="text-blue-500" />
          <span className="font-extrabold">
            Edit Profile & Academic Records
          </span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
      destroyOnHidden
      className="rounded-3xl overflow-hidden"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSave}
        initialValues={profile}
        className="pt-4"
      >
        <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">
          Contact & Location Settings
        </h3>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="fullName"
              label="Full Name"
              rules={[
                { required: true, message: "Please input your full name" },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="e.g. Alex" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="email"
              label="Primary Email Address"
              extra="This is the email linked to your account. To update it, use the 'Change Email Address' option in Security Settings."
            >
              <Input prefix={<MailOutlined />} disabled />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item name="phone" label="Contact Phone (Optional)">
              <Input
                prefix={<PhoneOutlined />}
                placeholder="e.g. +1 (555) 000-0000"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="address" label="Mailing/Postal address (Optional)">
              <Input prefix={<HomeOutlined />} placeholder="City, State" />
            </Form.Item>
          </Col>
        </Row>

        <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mt-6 mb-3">
          Secondary High School Information
        </h3>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="highSchoolName"
              label="High School Name"
              rules={[
                { required: true, message: "High school name is required" },
              ]}
            >
              <Input placeholder="Lincoln High School" />
            </Form.Item>
          </Col>
          <Col xs={12} md={6}>
            <Form.Item
              name="graduationYear"
              label="Graduation Year"
              rules={[{ required: true, message: "Required" }]}
            >
              <InputNumber min={2020} max={2035} className="w-full" />
            </Form.Item>
          </Col>
          <Col xs={12} md={6}>
            <Form.Item
              name="gpa"
              label="Cumulative GPA"
              rules={[{ required: true, message: "GPA is required" }]}
            >
              <InputNumber min={1.0} max={5.0} step={0.01} className="w-full" />
            </Form.Item>
          </Col>
        </Row>

        <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mt-6 mb-3">
          Standard Exam Results
        </h3>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="satScore"
              label="SAT Score"
              rules={[
                { required: true, message: "Mandatory" },
                {
                  type: "number",
                  min: 400,
                  max: 1600,
                  message: "Enter a value between 400 and 1600",
                },
              ]}
            >
              <InputNumber
                min={400}
                max={1600}
                step={10}
                placeholder="e.g. 1350"
                className="w-full"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="actScore" label="ACT Composite (Optional)">
              <InputNumber
                min={1}
                max={36}
                placeholder="Not taken"
                className="w-full"
              />
            </Form.Item>
          </Col>
        </Row>

        <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mt-6 mb-3">
          Match preferences board details
        </h3>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item name="preferredStates" label="Target States (Multiple)">
              {/* Options from GET /states: show full name, store 2-letter code. */}
              <Select
                mode="multiple"
                placeholder="Select Preferred States"
                className="w-full"
                loading={statesLoading}
                options={states.map((s) => ({
                  value: s.code,
                  label: s.name,
                }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="preferredPrograms"
              label="Target Curriculums / Majors"
            >
              <Select
                mode="multiple"
                placeholder="Select Majors"
                className="w-full"
                options={PROGRAM_OPTIONS.map((p) => ({ value: p, label: p }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item name="preferredDegreeLevel" label="Target Degree Level">
              {/* Options from GET /degree-levels in backend order; the canonical
                  string is both the value submitted and the label shown. */}
              <Select
                options={degreeLevels.map((d) => ({ value: d, label: d }))}
                loading={degreeLevelsLoading}
                placeholder="Select Degree"
                className="w-full"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="preferredCollegeType"
              label="Preferred College Type"
            >
              {/* Stored to the backend `preferred_college_type` column. Clearable
                  so the user can express "no preference" (empty value). */}
              <Select
                allowClear
                placeholder="Public or Private"
                className="w-full"
                options={[
                  { value: "Public", label: "Public" },
                  { value: "Private", label: "Private" },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" htmlType="submit">
            Save Changes
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
