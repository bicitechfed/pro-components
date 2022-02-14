import React, { useReducer, useEffect } from 'react';
import { Input, Button } from 'antd';
import { FunnelPlotFilled } from '@ant-design/icons';
import useMemoizedFn from '../useAntdResizableHeader/utils/useMemoizedFn';
import { isEmpty, pick, forEach } from 'lodash';

const valueTypes = ['select'];

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

const useAntdFilterHeader = ({ columns, proFilter, reload, proSort }: any) => {
  let searchInput: any = null;
  let onReset: any = null;
  const [filterState, dispatch] = useReducer(reducer, {});

  useEffect(() => {
    columns.map((column: any) => {
      if (column['defaultFilteredValue']) {
        dispatch({
          type: 'updateField',
          payload: {
            [column.dataIndex]: column['defaultFilteredValue'],
          },
        });
      }
      return null;
    });
  }, []);

  const handleSearch = (selectedKeys: any, confirm: any, dataIndex: any) => {
    dispatch({
      type: 'updateField',
      payload: {
        [dataIndex]: selectedKeys,
      },
    });
    confirm();
    reload();
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
    reload();
  };
  /** 自定义列筛选* */
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
      filterIcon: (filtered: any) => (
        <FunnelPlotFilled style={{ color: filtered ? '#1890ff' : undefined }} />
      ),
    };
    const newColumnProps = {
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => {
        onReset = clearFilters;
        return (
          <div style={{ padding: 8 }}>
            <Input
              ref={(node: any) => {
                searchInput = node;
              }}
              placeholder={`搜索${columnName}`}
              value={selectedKeys?.[0]}
              onChange={(e) => {
                setSelectedKeys(e.target.value ? [e.target.value] : []);
                // dispatch({
                //   type: 'updateField',
                //   payload: {
                //     [dataIndex]: {
                //       searchValue: e.target.value ? [e.target.value] : [],
                //       setSelectedKeys,
                //       clearFilters,
                //       searchInputNode: searchInput,
                //     },
                //   },
                // });
              }}
              onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
              style={{ marginBottom: 8, display: 'block' }}
            />
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
              <Button
                type="link"
                onClick={() => handleReset(clearFilters, selectedKeys, dataIndex, confirm)}
                size="small"
                disabled={!selectedKeys || selectedKeys.length === 0}
                style={{ width: 50 }}
              >
                重置
              </Button>
              <Button
                type="primary"
                onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
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
      onFilterDropdownVisibleChange: (visible: any) => {
        if (visible) {
          setTimeout(() => {
            searchInput.select();
          }, 100);
        }
      },
    };
    return valueTypes.some((currentValue) => valueType === currentValue)
      ? originTableFilterProps
      : newColumnProps;
  };
  /** 获取最终改造后的列属性信息* */
  const getColumns = useMemoizedFn((list) => {
    const trulyColumns = list?.filter((item: any) => !isEmpty(item));
    const c = trulyColumns.map((col: any) => {
      const param = pick(col, ['dataIndex', 'title', 'valueEnum', 'valueType', 'filteredValue']);
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

  const newColumns = getColumns(columns);
  return {
    filterColumns: newColumns,
    filterState: {
      ...proFilter,
      ...filterState,
    },
    dispatch,
    onReset,
  };
};

export default useAntdFilterHeader;
