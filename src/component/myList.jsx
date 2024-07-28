import initialData from "../data/contant";
import './style.css'
import moment from 'moment'
import {
    Table,
    Input,
    Button,
    Form,
    Modal,
    Popconfirm,
    message,
    Space
} from 'antd';
import React, { useState,  useEffect } from "react";


const MyList = () => {
    const [data, setData] = useState(initialData)
    const [visible, setVisible] = useState(false) //用于控制修改modal是否显示


    
    const [isAdding, setIsAdding] = useState(true); // 判断是新增还是编辑

    const [searchUserName, setSearchUserName] = useState('');
    const [searchEmail, setSearchEmail] = useState('');
    const [searchPhone, setSearchPhone] = useState('');

    const [form] = Form.useForm();//用于修改用户信息
    const [editingId, setEditingId] = useState(null);//用于传递ID
    const [firstRenderTime, setFirstRenderTime] = useState('')//初始化列表的创建时间
    const [modifyRenderTime, setModifyRenderTime] = useState('')//新建用户的创建时间


    //定义第一次创建时间
    useEffect(() => {
        setFirstRenderTime(moment().format('YYYY-MM-DD HH:mm:ss'))
    }, []);

    // 定义表头
    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: 'Created Time',
            dataIndex: 'createdTime',
            key: 'createdTime',
            render: (text, record) => { return <span>{firstRenderTime}</span> }
            // render: text => <span>{text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : 'N/A'}</span>,
        },
        {
            title: 'Modified Time',
            dataIndex: 'modifiedTime',
            key: 'modifiedTime',
            // render: (text, record) => { return <span>-</span> }
            render: text => <span>{text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-'}</span>,
        },
        {
            title: 'Action',
            key: 'action',
            render: (text, record) => (

                <Space>
                    <Button className='actionBtn' type="primary" onClick={() => handleEdit(record)}>
                        编辑
                    </Button>
                    <Popconfirm title="确定删除这条信息吗?" onConfirm={() => handleDelete(record.id)}>
                        <Button className='actionBtn' type="danger">删除</Button>

                    </Popconfirm>
                </Space>

            ),
        },
    ];

    // 定义回退到全部列表的函数
    const handleClearSearch = () => {
        setSearchUserName(''); // 重置用户名搜索状态
        setSearchEmail(''); // 重置邮箱搜索状态
        setSearchPhone(''); // 重置手机搜索状态
        setData(initialData); // 重新加载完整的数据列表
    };
    // 搜索功能
    const handleSearch = () => {
        if (searchUserName || searchEmail || searchPhone) {
            // 如果有搜索条件，执行过滤逻辑
            const filteredData = initialData.filter(item =>
                (searchUserName ? item.username.toLowerCase().includes(searchUserName.toLowerCase()) : true) &&
                (searchEmail ? item.email.toLowerCase().includes(searchEmail.toLowerCase()) : true) &&
                (searchPhone ? item.phone.toLowerCase().includes(searchPhone.toLowerCase()) : true)
            );
            setData(filteredData); // 更新数据列表为过滤后的数据
        } else {
            // 如果没有搜索条件，回退到全部列表
            handleClearSearch();
        }
    };

    //删除功能
    const handleDelete = (id) => {
        setData(data.filter(item => item.id !== id));
        message.success('成功删除该条记录');
    }


    //重新编辑功能
    const handleEdit = (record) => {
        setVisible(true);
        setEditingId(record.id);//传递要编辑的那一行id
        form.setFieldsValue({
            username: record.username,
            email: record.email,
            phone: record.phone,
        })

    }
    //修改信息：弹出框save函数
    const handleSave = () => {
        if (!isAdding) { //如果是修改模式
            form.validateFields()
                .then(values => {
                    let now = moment().format('YYYY-MM-DD HH:mm:ss')
                    const updateData = data.map(item => {
                        if (item.id === editingId) {
                            return {
                                ...item,
                                ...values,
                                modifiedTime: now, // 使用正确的时间格式
                            };
                        }
                        return item;
                    });

                    setData(updateData); // 确保使用setState来更新数据
                    setEditingId(null); // 清空编辑ID
                    setVisible(false);
                    message.success('更新完毕');
                })
                .catch(errorInfo => {
                    console.log('Failed to validate fields:', errorInfo);
                })
        }
        else {  //是新增模式

            form.validateFields()
                .then(values => {
                    let now = moment().format('YYYY-MM-DD HH:mm:ss')
                    const newUser = {
                        ...values,
                        id: data.length + 1, // 简单地为新用户分配一个唯一的ID
                        createdTime: now, // 创建时间
                        modifiedTime: now, // 修改时间
                    };
                    setData([...data, newUser]); // 将新用户添加到数组中
                    setVisible(false); // 关闭模态框
                    message.success('成功添加用户');
                })
                .catch(errorInfo => {
                    console.log('Failed to validate fields:', errorInfo);
                });
        }


    };
    //弹出框取消函数
    const handleCancel = () => {
        setVisible(false)
    }



    // 新增用户按钮
    const handleAddNewUser = () => {
        form.resetFields(); // 重置表单字段
        setVisible(true); // 显示模态框
        setIsAdding(true); // 设置为新增模式
    };

    // 表单布局配置
    const layout = {
        labelCol: { span: 4 },
        wrapperCol: { span: 16 },
    };
    //表单尾巴按钮布局配置
    const tailLayout = {
        wrapperCol: { offset: 4, span: 16 },
    };


    return (
        <div>
            <Input.Search
                placeholder="输入用户名进行搜索"
                onChange={(e) => setSearchUserName(e.target.value.trimStart())}
                onSearch={handleSearch}
                className="searchBox"
            />
            <Input.Search
                placeholder="输入邮箱进行搜索"
                onChange={(e) => setSearchEmail(e.target.value.trimStart())}
                onSearch={handleSearch}
                className="searchBox"
            />
            <Input.Search
                placeholder="输入手机进行搜索"
                onChange={(e) => setSearchPhone(e.target.value.trimStart())}
                onSearch={handleSearch}
                className="searchBox"
            />

            <Button type="primary" onClick={handleAddNewUser}>
                新增用户
            </Button>

            <Table
                columns={columns}
                dataSource={data}
                rowKey={record => record.id}
                pagination={{ pageSize: 10 }}
            />

            {/* 编辑信息时的弹出框 */}
            <Modal
                // 通过state修改显示状态
                visible={visible}
                okText='保存'
                cancelText='取消'
                onOk={handleSave}
                onCancel={handleCancel}
            >
                <Form
                    {...layout}
                    form={form}
                    initialValues={{
                        username: '',
                        email: '',
                        phone: '',
                    }}
                >

                    <Form.Item label="Username" name="username" rules={[{ required: true, message: 'Please input the username!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Please input the email!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Phone" name="phone" rules={[{ required: true, message: 'Please input the phone number!' }]}>
                        <Input />
                    </Form.Item>

                </Form>

            </Modal>

        </div>
    )
}
export default MyList