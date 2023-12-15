import React, { useState, useEffect } from "react";
import { Form, Input, Select, Checkbox, Button, Card, Table } from "antd";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";

const { Option } = Select;

const UserSectorForm = () => {
  const [form] = Form.useForm();
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [sectors, setSectors] = useState([]);
  const [selectedSectors, setSelectedSectors] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/sectors/all`).then((res) => {
      setSectors(res.data);
    });
  }, []);

  const onFinish = (values) => {
    const formData = {
      ...values,
      sectors: selectedSectors,
      id: "",
    };

    if (editing) {
      formData.id = editingKey;
      axios
        .put(
          `${process.env.REACT_APP_API_URL}/sectors/edit`,
          JSON.stringify(formData),
          {
            headers: { "Content-Type": "application/json" },
          }
        )
        .then((response) => {
          toast.success("Data updated successfully!");
          setSubmissions([
            ...submissions,
            { ...response.data, key: submissions.length },
          ]);
          form.resetFields();
          setEditing(false);
        })
        .catch((error) => toast.error("Error updating data!"));
    } else {
      axios
        .post(
          `${process.env.REACT_APP_API_URL}/sectors`,
          JSON.stringify(formData),
          {
            headers: { "Content-Type": "application/json" },
          }
        )
        .then((response) => {
          toast.success("Data saved successfully!");
          setSubmissions([
            ...submissions,
            { ...response.data, key: submissions.length },
          ]);
          form.resetFields();
        })
        .catch((error) => toast.error("Error saving data!"));
    }
  };

  const handleSelectChange = (value) => {
    const selectedSectors = value.join(", ");
    setSelectedSectors(selectedSectors);
  };

  const [editingKey, setEditingKey] = useState(""); // Key of the editing row

  const edit = (record) => {
    form.setFieldsValue({ name: "", sectors: [], ...record });
    setEditingKey(record.key);
    setEditing(true);
  };

  const renderOptions = (sectors) => {
    return sectors.map((sector) => (
      <Select.OptGroup key={sector.id} label={sector.name}>
        {sector.subcategories.map((subcategory) => [
          <Option key={subcategory.id} value={subcategory.name}>
            {subcategory.name}
          </Option>,
          subcategory.subSubcategories.map((subSubcategory) => (
            <Option key={subSubcategory.id} value={subSubcategory.name}>
              &nbsp;&nbsp;&nbsp;{subSubcategory.name}
            </Option>
          )),
        ])}
      </Select.OptGroup>
    ));
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <div className="row">
        <Card title="User Sector Form" style={{ width: 300 }}>
          <Form form={form} onFinish={onFinish} layout="vertical">
            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true, message: "Please input your name!" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Sectors"
              name="sectors"
              rules={[
                {
                  required: true,
                  message: "Please select at least one sector!",
                },
              ]}
            >
              <Select
                mode="multiple"
                placeholder="Select sectors"
                style={{ width: "100%" }}
                onChange={handleSelectChange}
              >
                {renderOptions(sectors)}
              </Select>
            </Form.Item>

            <Form.Item>
              <Checkbox
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
              >
                Agree to terms
              </Checkbox>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                disabled={!agreedToTerms}
              >
                {!editing ? "Save" : "Update"}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
      {submissions.length > 0 && (
        <Table dataSource={submissions} style={{ marginTop: 20 }}>
          <Table.Column title="Name" dataIndex="name" key="name" />
          <Table.Column title="Sectors" dataIndex="sectors" key="sectors" />
          <Table.Column
            title="Action"
            dataIndex="action"
            render={(_, record) => {
              return (
                <Button
                  disabled={editingKey !== ""}
                  onClick={() => edit(record)}
                >
                  Edit
                </Button>
              );
            }}
          />
        </Table>
      )}

      <ToastContainer />
    </div>
  );
};

export default UserSectorForm;
