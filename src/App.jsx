import React, { useState, useEffect } from 'react';
import { Layout, Input, List, Typography, Row, Col, Modal, Form, Button } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css';
import moment from 'moment';
import axios from 'axios'; // Import your Axios instance
import './App.css';

const { Header, Content, Footer } = Layout;
const { Text } = Typography;

const App = () => {
  const ip='10.13.16.156:3001';
  const [data, setData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [form] = Form.useForm();
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await axios.get('http://'+ip+'/account/list-accounts');
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const formatDateTime = (isoString) => {
    return moment(isoString).format('MMMM Do YYYY, h:mm:ss A');
  };

  const onSearch = (value) => {
  if (value.trim() === '') {
    fetchAccounts(); // Reload all data when the search input is empty
    setSearchText('');
  } else {
    const filteredData = data.filter(item =>
      item.name.toLowerCase().includes(value.toLowerCase())
    );
    setData(filteredData);
    setSearchText(value);
  }
};


  const showEditModal = (item) => {
    setCurrentItem(item);
    form.setFieldsValue(item);
    setIsEditModalVisible(true);
  };

  const showAddModal = () => {
    form.resetFields();
    setCurrentItem(null);
    setIsAddModalVisible(true);
  };

  const handleEditOk = async () => {
    try {
      const values = await form.validateFields();
      values.id = currentItem.id;
      console.log(values, currentItem);
      await axios.put(`http://`+ip+`/account/update-account/${currentItem.id}`, values);
      fetchAccounts(); // Refresh the data
      setIsEditModalVisible(false);
    } catch (error) {
      console.error('Validate Failed:', error);
    }
  };

  const handleAddOk = async () => {
    try {
      const values = await form.validateFields();
      await axios.post('http://'+ip+'/account/create-account', values);
      fetchAccounts(); // Refresh the data
      setIsAddModalVisible(false);
    } catch (error) {
      console.error('Validate Failed:', error);
    }
  };

  const handleCancel = () => {
    setIsEditModalVisible(false);
    setIsAddModalVisible(false);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://`+ip+`/account/delete-account/${currentItem.id}`);
      fetchAccounts(); // Refresh the data
      setIsEditModalVisible(false);
    } catch (error) {
      console.error('Delete Failed:', error);
    }
  };

  const calculateTotalPrice = () => {
    return data.reduce((total, item) => {
      const price = parseInt(item.price);
      return total + price;
    }, 0).toFixed(2);
  };

  return (
    <Layout>
      <Header className="header" style={{ backgroundColor: '#195190', color: '#fff' }}>
        <Row justify="space-between" align="middle" className="header-row">
          <Col>
            <Text strong className="header-text">Total: ₹{calculateTotalPrice()}</Text>
          </Col>
          <Col flex="auto" className="header-search" style={{ borderColor: '#2c7ab8', borderWidth: '2px', borderStyle: 'solid' }}>
            <div className="mobile-icons">
              <Button
                type="primary"
                shape="circle"
                icon={<SearchOutlined />}
                size="large"
                onClick={() => setIsSearchVisible(!isSearchVisible)}
                className="mobile-search-icon"
                style={{ backgroundColor: '#2c7ab8' }}
              />
              <Button
                type="primary"
                shape="circle"
                icon={<PlusOutlined />}
                size="large"
                onClick={showAddModal}
                className="add-button mobile-add-button"
                style={{ backgroundColor: '#2c7ab8' }}
              />
            </div>
          </Col>
          <Col className="desktop-add-button-col">
            <Button
              type="primary"
              shape="circle"
              icon={<PlusOutlined />}
              size="large"
              onClick={showAddModal}
              className="add-button desktop-add-button"
              style={{ backgroundColor: '#2c7ab8' }}
            />
          </Col>
        </Row>
        {isSearchVisible && (
          <Input
            placeholder="Search by name"
            enterButton={false}
            size="large"
            value={searchText}
            onChange={e => onSearch(e.target.value)}
            className="search-input mobile-search"
            style={{ borderColor: '#2c7ab8', borderWidth: '2px', borderStyle: 'solid', color: 'darkblue', backgroundColor: '#fff' }}
          />
        )}
      </Header>
      <Content style={{ padding: '0 4px', marginTop: isSearchVisible ? '50px' : '0' }}>
        <div className="site-layout-content" style={{ marginTop: '20px' }}>
          <Row justify="center">
            <Col xs={24} sm={24} md={20} lg={16}>
              <List
                itemLayout="horizontal"
                dataSource={data}
                renderItem={item => (
                  <List.Item
                    style={{ padding: '10px 20px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }}
                    onClick={() => showEditModal(item)}
                  >
                    <List.Item.Meta
                      title={<Text strong style={{ fontSize: '16px', fontWeight: 'bolder' }}>{item.name}</Text>}
                      description={
                        <>
                          <Text style={{ fontSize: '14px', color: '#888', fontWeight: 'bold' }}>{formatDateTime(item.updatedAt)}</Text>
                        </>
                      }
                    />
                    <Text type="secondary" style={{ marginLeft: 'auto', fontSize: '16px', color: '#195190', fontWeight: 'bold' }}>₹{item.price}</Text>
                  </List.Item>
                )}
                style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', borderColor: '#2c7ab8', borderWidth: '2px', borderStyle: 'solid' }}
              />
            </Col>
          </Row>
        </div>
      </Content>

      <Modal
        title="Update Item"
        visible={isEditModalVisible}
        onOk={handleEditOk}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="delete" type="danger" onClick={handleDelete}>
            Delete
          </Button>,
          <Button key="submit" type="primary" onClick={handleEditOk}>
            Update
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please input the name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Price"
            name="price"
            rules={[{ required: true, message: 'Please input the price!' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Add New Item"
        visible={isAddModalVisible}
        onOk={handleAddOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please input the name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Price"
            name="price"
            rules={[{ required: true, message: 'Please input the price!' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default App;
