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
import {
  StudentProfile,
  SAC_STATES,
  SAC_PROGRAMS,
} from "../../../data/mockProfile";

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
              <Input
                prefix={<UserOutlined />}
                placeholder="e.g. Rahul Vidyabhushan"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="email"
              label="Primary Email Address"
              rules={[
                { required: true, message: "Please input email address" },
                { type: "email", message: "Enter a valid email structure" },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="e.g. rahul@degfinder.com"
              />
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
          <Col xs={12} md={8}>
            <Form.Item
              name="satReadingWriting"
              label="SAT Read/Write Score"
              rules={[{ required: true, message: "Mandatory" }]}
            >
              <InputNumber min={200} max={800} step={10} className="w-full" />
            </Form.Item>
          </Col>
          <Col xs={12} md={8}>
            <Form.Item
              name="satMath"
              label="SAT Math Score"
              rules={[{ required: true, message: "Mandatory" }]}
            >
              <InputNumber min={200} max={800} step={10} className="w-full" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
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
              <Select
                mode="multiple"
                placeholder="Select Preferred States"
                className="w-full"
                options={SAC_STATES.map((s) => ({
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
                options={SAC_PROGRAMS.map((p) => ({ value: p, label: p }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24}>
            <Form.Item name="preferredDegreeLevel" label="Target Degree Level">
              <Select
                options={[
                  { value: "Associate", label: "Associate Degree" },
                  { value: "Bachelor's", label: "Bachelor's Degree" },
                  { value: "Master's", label: "Master's Degree" },
                  { value: "Doctorate", label: "Doctorate Level" },
                ]}
                placeholder="Select Degree"
                className="w-full"
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
