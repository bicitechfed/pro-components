import React, { createRef, useEffect, useMemo, useState } from 'react';
import { Button, DatePicker, Space, Table } from 'antd';
import type { ProColumns } from 'bici-pro-table';
import ProTable, { ActionType } from 'bici-pro-table';
import { SearchOutlined } from '@ant-design/icons';
import request from 'umi-request';
import { ProFieldRequestData, RequestOptionsType } from '@ant-design/pro-utils';

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
  const [filtered, setFiltered] = useState<any>({
    name: ['majy'],
  });
  const tableRef = createRef<ActionType>();
  const [opts, setOpts] = useState([]);

  const requestStateMap: ProFieldRequestData = async () => {
    let data: RequestOptionsType[] = [];
    return request
      .get('https://proapi.azurewebsites.net/github/issues')
      .then(function (response) {
        if (response && response.data) {
          response.data.map((item: any) => {
            data.push({
              label: item.title,
              value: item.id,
            });
          });
        }
        console.log('>>>>column request>>>', response);
        // setOpts(data);
        return data;
      })
      .catch(function (error) {
        console.log(error);
        return data;
      });
  };

  const handleSetOption = async () => {
    requestStateMap({}, {}).then((res) => {
      setOpts(res);
    });
  };
  useEffect(() => {
    handleSetOption();
  }, []);

  const columns: ProColumns<TableListItem>[] = useMemo(
    () => [
      {
        key: 'title',
        title: '应用名称',
        width: 120,
        dataIndex: 'title',
        fixed: 'left',
        valueType: 'digit',
        render: (_) => <a>{_}</a>,
      },
      {
        title: '容器数量',
        width: 120,
        dataIndex: 'number',
        key: 'number',
        align: 'right',
        search: false,
        filteredValue: filtered['containers'],
        sorter: (a, b) => a.containers - b.containers,
      },
      {
        title: '调用次数',
        width: 200,
        align: 'right',
        dataIndex: 'comments',
        key: 'comments',
        filters: true,
        filteredValue: filtered['comments'],
        onFilter: true,
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
        title: '远程获取数据',
        dataIndex: 'test',
        key: 'test',
        valueType: 'select',
        filters: true,
        onFilter: true,
        width: 100,
        defaultFilteredValue: [624748504],
        // request:requestStateMap,
        valueEnum: {
          all: { text: '全部' },
          付小小: { text: '付小小' },
          曲丽丽: { text: '曲丽丽' },
          林东东: { text: '林东东' },
          陈帅帅: { text: '陈帅帅' },
          兼某某: { text: '兼某某' },
        },
        fieldProps: {
          options: opts,
          mode: 'multiple',
          dropdownStyle: { width: 200 },
        },
      },
      {
        title: '创建者',
        width: 300,
        filters: true,
        onFilter: true,
        dataIndex: 'user',
        key: 'user',
        valueType: 'select',
        filterMultiple: false,
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
        key: 'created_at',
        dataIndex: 'created_at',
        valueType: 'dateRange',
        renderFormItem: () => {
          return <RangePicker />;
        },
      },
      {
        title: '备注',
        dataIndex: 'memo',
        key: 'memo',
        valueType: 'dateRange',
        ellipsis: true,
        copyable: true,
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
    ],
    [setFiltered, opts, setOpts],
  );
  return (
    <ProTable<TableListItem>
      actionRef={tableRef}
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
        defaultSelectedRowKeys: [],
      }}
      tableAlertOptionRender={() => {
        return (
          <Space size={16}>
            <a>批量删除</a>
            <a>导出数据</a>
          </Space>
        );
      }}
      scroll={{ x: 1900 }}
      search={false}
      rowKey="key"
      headerTitle="批量操作"
      toolBarRender={() => [
        <Button key="show" onClick={handleSetOption}>
          查看日志
        </Button>,
      ]}
      onRequestError={(e) => {
        console.log('error', e);
      }}
    />
  );
};
