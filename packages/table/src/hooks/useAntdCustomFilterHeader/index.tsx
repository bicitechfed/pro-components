import React, { useReducer, useEffect } from 'react';
import { Input, Button, DatePicker } from 'antd';
import { FunnelPlotFilled } from '@ant-design/icons';
import useMemoizedFn from '../useAntdResizableHeader/utils/useMemoizedFn';
import { isEmpty, pick, forEach } from 'lodash';
import moment, { Moment } from 'moment';

const { RangePicker } = DatePicker;

const valueTypes = ['select'];

export declare type EventValue<DateType> = DateType | null;
export declare type RangeValue<DateType> = [EventValue<DateType>, EventValue<DateType>] | null;
type RangeDateType = [EventValue<Moment>, EventValue<Moment>];

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

const useAntdFilterHeader = ({ columns, proFilter, reload }: any) => {
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

  const handleDataChange = (date: any, dateString: any, setSelectedKeys: any) => {
    setSelectedKeys([dateString]);
  };

  // 专门处理日期筛选dom
  const dateDom = (setSelectedKeys: any, selectedKeys: string[]) => {
    let value = null;
    let rangeValue: RangeDateType = [null, null];
    if (typeof selectedKeys[0] === 'string') {
      value = moment(selectedKeys[0]);
    } else {
      rangeValue = selectedKeys[0]
        ? [moment(selectedKeys[0][0]), moment(selectedKeys[0][1])]
        : [null, null];
    }
    return {
      date: (
        <DatePicker
          showToday
          value={value}
          onChange={(date, dateString) => handleDataChange(date, dateString, setSelectedKeys)}
        />
      ),
      dateTime: (
        <DatePicker
          showTime
          value={value}
          onChange={(date, dateString) => handleDataChange(date, dateString, setSelectedKeys)}
        />
      ),
      dateWeek: (
        <DatePicker
          picker="week"
          value={value}
          onChange={(date, dateString) => handleDataChange(date, dateString, setSelectedKeys)}
        />
      ),
      dateMonth: (
        <DatePicker
          picker="month"
          value={value}
          onChange={(date, dateString) => handleDataChange(date, dateString, setSelectedKeys)}
        />
      ),
      dateQuarter: (
        <DatePicker
          picker="quarter"
          value={value}
          onChange={(date, dateString) => handleDataChange(date, dateString, setSelectedKeys)}
        />
      ),
      dateYear: (
        <DatePicker
          picker="year"
          value={value}
          onChange={(date, dateString) => handleDataChange(date, dateString, setSelectedKeys)}
        />
      ),
      dateRange: (
        <RangePicker
          value={rangeValue}
          onChange={(date, dateString) => handleDataChange(date, dateString, setSelectedKeys)}
        />
      ),
      dateTimeRange: (
        <RangePicker
          showTime
          value={rangeValue}
          onChange={(date, dateString) => handleDataChange(date, dateString, setSelectedKeys)}
        />
      ),
      time: (
        <DatePicker
          picker="time"
          value={value}
          onChange={(date, dateString) => handleDataChange(date, dateString, setSelectedKeys)}
        />
      ),
    };
  };

  const dateValueTypes = [
    'date',
    'dateTime',
    'dateWeek',
    'dateMonth',
    'dateQuarter',
    'dateYear',
    'dateRange',
    'dateTimeRange',
    'time',
  ];

  /** 自定义列筛选* */
  const getColumnSearchProps = ({
    dataIndex,
    columnName = '关键字',
    valueEnum = {},
    valueType = 'text',
    fieldProps,
    request,
  }: any) => {
    const filters: any = [];
    forEach(valueEnum, (value: object, key) => {
      filters.push({
        ...value,
        value: key,
      });
    });
    if (fieldProps && fieldProps.options) {
      filters.length = 0;
      forEach(fieldProps.options, (item: any) => {
        filters.push({
          text: item.label || item.text,
          value: item.value,
        });
      });
    }
    const originTableFilterProps = {
      filters,
      filterSearch: true,
      onFilterDropdownVisibleChange: async (visible: boolean) => {
        if (visible && request && typeof request === 'function') {
          const data = await request();
          filters.length = 0;
          forEach(data, (item: any) => {
            filters.push({
              text: item.label || item.text,
              value: item.value,
            });
          });
        }
      },
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
            if (searchInput) {
              searchInput.select();
            }
          }, 100);
        }
      },
    };

    if (dateValueTypes.some((type) => type === valueType)) {
      newColumnProps['filterDropdown'] = ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }: any) => {
        onReset = clearFilters;
        return (
          <div style={{ padding: 8 }}>
            {dateDom(setSelectedKeys, selectedKeys)[valueType]}
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 8,
              }}
            >
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
      };
    }

    return valueTypes.some((currentValue) => valueType === currentValue)
      ? originTableFilterProps
      : newColumnProps;
  };
  /** 获取最终改造后的列属性信息* */
  const getColumns = useMemoizedFn((list) => {
    const trulyColumns = list?.filter((item: any) => !isEmpty(item));
    const c = trulyColumns.map((col: any) => {
      const param = pick(col, [
        'dataIndex',
        'title',
        'valueEnum',
        'valueType',
        'filteredValue',
        'fieldProps',
        'request',
      ]);
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
