import React, { useState, useReducer, useRef } from 'react';
import { Input, Space, Button, Highlighter } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import useMemoizedFn from '../useAntdResizableHeader/utils/useMemoizedFn';
import { isEmpty } from 'lodash';
import { GETKEY } from '../useAntdResizableHeader/utils/useGetDataIndexColumns';

const useAntdFilterHeader = ({ columns }) => {
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    console.log('---handleSearch---');
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    console.log('---handleReset---');
  };
  console.log('-----useAntdFilterHeader----');
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={(node) => {
            searchInput = node;
          }}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button onClick={() => handleReset(clearFilters)} size="small" style={{ width: 90 }}>
            Reset
          </Button>
          <Button type="link" size="small" onClick={() => {}}>
            Filter
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        : '',
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.select(), 100);
      }
    },
    render: (text) => text,
  });
  const getColumns = useMemoizedFn((list) => {
    const trulyColumns = list?.filter((item) => !isEmpty(item));
    const c = trulyColumns.map((col) => {
      const extraColumnProps = getColumnSearchProps(col.dataIndex);
      return {
        ...col,
        ...extraColumnProps,
      };
    });

    return c;
  });
  const [filterColumns, setFilterColumns] = useState([]);

  let searchInput: any = null;

  return {
    filterColumns: getColumns(columns),
  };
};

export default useAntdFilterHeader;
