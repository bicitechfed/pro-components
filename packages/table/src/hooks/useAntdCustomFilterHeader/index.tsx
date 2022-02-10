import React, { useReducer } from 'react';
import { Input, Button } from 'antd';
import { FunnelPlotFilled } from '@ant-design/icons';
import useMemoizedFn from '../useAntdResizableHeader/utils/useMemoizedFn';
import { isEmpty, pick, forEach } from 'lodash';

function reducer(state: any, action: any) {
  switch (action.type) {
    case 'updateField':
      return {
        ...state,
        ...action.payload,
      };
    default:
      throw new Error();
  }
}

const useAntdFilterHeader = ({ columns }: any) => {
  let searchInput: any = null;
  const [filterState, dispatch] = useReducer(reducer, {});

  const handleSearch = (
    selectedKeys: any,
    confirm: any,
    dataIndex: any,
    setSelectedKeys: any,
    clearFilters: any,
    searchInputNode: any,
  ) => {
    dispatch({
      type: 'updateField',
      payload: {
        [dataIndex]: { searchValue: selectedKeys, setSelectedKeys, clearFilters, searchInputNode },
      },
    });
    confirm();
  };

  const handleReset = (clearFilters: any, selectedKeys: any, dataIndex: any, confirm: any) => {
    dispatch({
      type: 'updateField',
      payload: {
        [dataIndex]: null,
      },
    });
    clearFilters();
    confirm();
  };
  const getColumnSearchProps = ({
    dataIndex,
    columnName = '关键字',
    valueEnum = {},
    valueType = 'text',
  }: any) => {
    const filters: any = [];
    forEach(valueEnum, (value: object, key) => {
      filters.push({
        ...value,
        value: key,
      });
    });
    const originTableFilterProps = {
      filters,
      onFilter: () => {
        return '';
      },
      filterSearch: false,
    };
    const newColumnProps = {
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => {
        return (
          <div style={{ padding: 8 }}>
            <Input
              ref={(node: any) => {
                searchInput = node;
              }}
              placeholder={`搜索${columnName}`}
              value={filterState[dataIndex]?.searchValue?.[0]}
              onChange={(e) => {
                setSelectedKeys(e.target.value ? [e.target.value] : []);
                dispatch({
                  type: 'updateField',
                  payload: {
                    [dataIndex]: {
                      searchValue: e.target.value ? [e.target.value] : [],
                      setSelectedKeys,
                      clearFilters,
                      searchInputNode: searchInput,
                    },
                  },
                });
              }}
              onPressEnter={() =>
                handleSearch(
                  selectedKeys,
                  confirm,
                  dataIndex,
                  setSelectedKeys,
                  clearFilters,
                  searchInput,
                )
              }
              style={{ marginBottom: 8, display: 'block' }}
            />
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
              <Button
                type="link"
                onClick={() => handleReset(clearFilters, selectedKeys, dataIndex, confirm)}
                size="small"
                style={{ width: 50 }}
              >
                重置
              </Button>
              <Button
                type="primary"
                onClick={() =>
                  handleSearch(
                    selectedKeys,
                    confirm,
                    dataIndex,
                    setSelectedKeys,
                    clearFilters,
                    searchInput,
                  )
                }
                size="small"
                style={{ width: 50 }}
              >
                确定
              </Button>
            </div>
          </div>
        );
      },
      filterIcon: (filtered: any) => (
        <FunnelPlotFilled style={{ color: filtered ? '#1890ff' : undefined }} />
      ),
      // onFilter: (value: any, record: any) =>
      //   record[dataIndex]
      //     ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
      //     : '',
      onFilterDropdownVisibleChange: (visible: any) => {
        if (visible) {
          setTimeout(() => {
            searchInput.select();
          }, 100);
        }
      },
      render: (text: any) => text,
    };
    return valueType === 'select' ? originTableFilterProps : newColumnProps;
  };
  /** 获取最终改造后的列属性信息* */
  const getColumns = useMemoizedFn((list) => {
    const trulyColumns = list?.filter((item: any) => !isEmpty(item));
    const c = trulyColumns.map((col: any) => {
      const param = pick(col, ['dataIndex', 'title', 'valueEnum', 'valueType']);
      const extraColumnProps =
        col.search !== false
          ? getColumnSearchProps({
              ...param,
              columnName: col.title,
            })
          : {};
      return {
        ...col,
        ...extraColumnProps,
      };
    });

    return c;
  });

  return {
    filterColumns: getColumns(columns),
    filterState,
    dispatch,
  };
};

export default useAntdFilterHeader;
