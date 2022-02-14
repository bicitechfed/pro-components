import React, { useState } from 'react';
import { Button, DatePicker, Space, Table } from 'antd';
import type { ProColumns } from 'bici-pro-table';
import ProTable from 'bici-pro-table';
import { SearchOutlined } from '@ant-design/icons';
import request from 'umi-request';

const { RangePicker } = DatePicker;

const valueEnum = {
  0: 'close',
  1: 'running',
  2: 'online',
  3: 'error',
};

const ProcessMap = {
  close: 'normal',
  running: 'active',
  online: 'success',
  error: 'exception',
};

export type TableListItem = {
  key: number;
  name: string;
  progress: number;
  containers: number;
  callNumber: number;
  creator: string;
  status: string;
  createdAt: number;
  memo: string;
};
const tableListDataSource: TableListItem[] = [];

const creators = ['付小小', '曲丽丽', '林东东', '陈帅帅', '兼某某'];

for (let i = 0; i < 5; i += 1) {
  tableListDataSource.push({
    key: i,
    name: 'AppName',
    containers: Math.floor(Math.random() * 20),
    callNumber: Math.floor(Math.random() * 2000),
    progress: Math.ceil(Math.random() * 100) + 1,
    creator: creators[Math.floor(Math.random() * creators.length)],
    status: valueEnum[Math.floor(Math.random() * 10) % 4],
    createdAt: Date.now() - Math.floor(Math.random() * 100000),
    memo: i % 2 === 1 ? '很长很长很长很长很长很长很长的文字要展示但是要留下尾巴' : '简短备注文案',
  });
}

export default () => {
  const [filtered, setFiltered] = useState<any>({});
  const columns: ProColumns<TableListItem>[] = [
    {
      key: 'name',
      title: '应用名称',
      width: 120,
      dataIndex: 'name',
      fixed: 'left',
      filteredValue: filtered['name'],
      render: (_) => <a>{_}aaa</a>,
    },
    {
      title: '容器数量',
      width: 120,
      dataIndex: 'containers',
      key: 'containers',
      align: 'right',
      search: false,
      filteredValue: filtered['containers'],
      sorter: (a, b) => a.containers - b.containers,
    },
    {
      title: '调用次数',
      width: 120,
      align: 'right',
      dataIndex: 'callNumber',
      key: 'callNumber',
      filters: true,
      filteredValue: filtered['callNumber'],
      onFilter: true,
      valueType: 'date',
    },
    {
      title: '执行进度',
      dataIndex: 'progress',
      key: 'progress',
      filteredValue: filtered['progress'],
      valueType: (item) => ({
        type: 'progress',
        status: ProcessMap[item.status],
      }),
    },
    {
      title: '创建者',
      width: 300,
      filters: true,
      onFilter: true,
      dataIndex: 'creator',
      key: 'creator',
      valueType: 'select',
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
      ),
      valueEnum: {
        all: { text: '全部' },
        付小小: { text: '付小小' },
        曲丽丽: { text: '曲丽丽' },
        林东东: { text: '林东东' },
        陈帅帅: { text: '陈帅帅' },
        兼某某: { text: '兼某某' },
      },
    },
    {
      title: '创建时间',
      width: 140,
      key: 'since',
      dataIndex: 'createdAt',
      valueType: 'date',
      sorter: (a, b) => a.createdAt - b.createdAt,
      renderFormItem: () => {
        return <RangePicker />;
      },
    },
    {
      title: '备注',
      dataIndex: 'memo',
      key: 'memo',
      ellipsis: true,
      copyable: true,
      search: false,
    },
    {
      title: '操作',
      width: 80,
      key: 'option',
      valueType: 'option',
      fixed: 'right',
      search: false,
      render: () => [<a key="link">链路</a>],
    },
  ];
  return (
    <ProTable<TableListItem>
      columns={columns}
      params={{ a: 1, b: 2 }}
      request={async (params = {}, sorter = {}, filter = {}) => {
        console.log(params, sorter, filter);
        setFiltered(filter);
        return request('https://proapi.azurewebsites.net/github/issues', {
          params,
        });
      }}
      rowSelection={{
        // 自定义选择项参考: https://ant.design/components/table-cn/#components-table-demo-row-selection-custom
        // 注释该行则默认不显示下拉选项
        selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
        defaultSelectedRowKeys: [1],
      }}
      tableAlertRender={({ selectedRowKeys, selectedRows, onCleanSelected }) => (
        <Space size={24}>
          <span>
            已选 {selectedRowKeys.length} 项
            <a style={{ marginLeft: 8 }} onClick={onCleanSelected}>
              取消选择
            </a>
          </span>
          <span>{`容器数量: ${selectedRows.reduce(
            (pre, item) => pre + item.containers,
            0,
          )} 个`}</span>
          <span>{`调用量: ${selectedRows.reduce(
            (pre, item) => pre + item.callNumber,
            0,
          )} 次`}</span>
        </Space>
      )}
      tableAlertOptionRender={() => {
        return (
          <Space size={16}>
            <a>批量删除</a>
            <a>导出数据</a>
          </Space>
        );
      }}
      dataSource={tableListDataSource}
      scroll={{ x: 1300 }}
      search={false}
      rowKey="key"
      headerTitle="批量操作"
      toolBarRender={() => [<Button key="show">查看日志</Button>]}
    />
  );
};
