import React, { useState, useEffect } from "react";
import { Form, Input, Select, Checkbox, Button, Card } from "antd";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const { Option } = Select;

const UserSectorForm = () => {
  const [form] = Form.useForm();
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [sectors, setSectors] = useState([]);
  const [selectedSectors, setSelectedSectors] = useState([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/sectors/all`)
      .then((response) => response.json())
      .then((data) => setSectors(data))
      .catch((error) => console.error("Error fetching data: ", error));
  }, []);

  const onFinish = (values) => {
    const formData = {
      ...values,
      sectors: selectedSectors,
    };
    fetch(`${process.env.REACT_APP_API_URL}/sectors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        toast.success("Data saved successfully!");
        form.resetFields();
      })
      .catch((error) => toast.error("Error saving data!"));
  };

  const handleSelectChange = (value) => {
    const selectedSectors = value.join(", ");
    setSelectedSectors(selectedSectors);
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
      <Card title="User Sector Form" style={{ width: 300 }}>
        {selectedSectors.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            You selected: {selectedSectors}
          </div>
        )}
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
              { required: true, message: "Please select at least one sector!" },
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
            <Button type="primary" htmlType="submit" disabled={!agreedToTerms}>
              Save
            </Button>
          </Form.Item>
        </Form>
      </Card>
      <ToastContainer />
    </div>
  );
};

export default UserSectorForm;
