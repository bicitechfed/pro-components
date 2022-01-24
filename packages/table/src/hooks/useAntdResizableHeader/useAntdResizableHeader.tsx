import React from 'react';
import ResizableHeader from './ResizableHeader';
import { option } from './config';
import { isEmpty } from 'lodash';
import useThrottleEffect from './utils/useThrottleEffect';
import useDebounceFn from './utils/useDebounceFn';
import { depthFirstSearch } from './utils';
import useSafeState from './utils/useSafeState';
import useLocalColumns from './utils/useLocalColumns';
import { GETKEY } from './utils/useGetDataIndexColumns';
import useMemoizedFn from './utils/useMemoizedFn';

export type ColumnsState = {
  width: number;
};

export type ColumnsStateType = {
  /**
   * 持久化的类型，支持 localStorage 和 sessionStorage
   *
   * @param localStorage 设置在关闭浏览器后也是存在的
   * @param sessionStorage 关闭浏览器后会丢失
   */
  persistenceType?: 'localStorage' | 'sessionStorage';
  /** 持久化的key，用于存储到 storage 中 */
  persistenceKey?: string;
};

export type useTableResizableHeaderProps<ColumnType> = {
  columns: ColumnType[] | undefined;
  /** 最后一列不能拖动，设置最后一列的最小展示宽度，默认120 */
  defaultWidth?: number;
  /** 拖动最小宽度 默认0 */
  minConstraints?: number;
  /** 拖动最大宽度 默认无穷 */
  maxConstraints?: number;
  /** 是否缓存宽度 */
  cache?: boolean;
  /** 列状态的配置，可以用来操作列拖拽宽度 */
  columnsState?: ColumnsStateType;
};

type Width = number | string;

export type ColumnOriginType<T> = {
  width?: Width;
  dataIndex?: React.Key;
  key?: React.Key;
  title?: React.ReactNode | string;
  children?: T[];
  resizable?: boolean;
  ellipsis?: any;
};

type CacheType = { width?: Width; index: number };

const WIDTH = 120;

function useAntdResizableHeader<
  ColumnType extends ColumnOriginType<ColumnType> = Record<string, any>,
>(props: useTableResizableHeaderProps<ColumnType>) {
  const {
    columns: columnsProp,
    defaultWidth = WIDTH,
    minConstraints = WIDTH / 2,
    maxConstraints = Infinity,
    cache = true,
    columnsState,
  } = props;

  // column的宽度缓存，避免render导致columns宽度重置
  // add column width cache to avoid column's width reset after render
  const widthCache = React.useRef<Map<React.Key, CacheType>>(new Map());

  const [resizableColumns, setResizableColumns] = useSafeState<ColumnType[]>([]);

  const { localColumns: columns, resetLocalColumns } = useLocalColumns({
    columnsState,
    columns: columnsProp,
    resizableColumns,
  });

  const [tableWidth, setTableWidth] = useSafeState<number>();

  const [triggerRender, forceRender] = React.useReducer((s) => s + 1, 0);

  const resetColumns = useMemoizedFn(() => {
    widthCache.current = new Map();
    resetLocalColumns();
  });

  const onMount = React.useCallback(
    (id: React.Key | undefined) => (width?: number) => {
      if (width) {
        setResizableColumns((t) => {
          const nextColumns = depthFirstSearch(t, (col) => col[GETKEY] === id, width);

          const kvMap = new Map<React.Key, CacheType>();

          function dig(cols: ColumnType[]) {
            cols.forEach((col, i) => {
              const key = col[GETKEY];
              kvMap.set(key ?? '', { width: col?.width, index: i });
              if (col?.children) {
                dig(col.children);
              }
            });
          }

          dig(nextColumns);

          widthCache.current = kvMap;

          return nextColumns;
        });
      }
    },
    [setResizableColumns],
  );

  const onResize = React.useMemo(() => onMount, [onMount]);

  const getColumns = useMemoizedFn((list: ColumnType[]) => {
    const trulyColumns = list?.filter((item) => !isEmpty(item));
    const c = trulyColumns.map((col) => {
      return {
        ...col,
        children: col?.children?.length ? getColumns(col.children) : undefined,
        onHeaderCell: (column: ColumnType) => {
          return {
            title: typeof col?.title === 'string' ? col?.title : '',
            width: cache
              ? widthCache.current?.get(column[GETKEY] ?? '')?.width || column?.width
              : column?.width,
            resizable: column.resizable,
            onMount: onMount(column?.[GETKEY]),
            onResize: onResize(column?.[GETKEY]),
            minWidth: minConstraints,
            maxWidth: maxConstraints,
            triggerRender,
          };
        },
        width: cache ? widthCache.current?.get(col[GETKEY] ?? '')?.width || col?.width : col?.width,
        ellipsis: typeof col.ellipsis !== 'undefined' ? col.ellipsis : true,
        [GETKEY]: col[GETKEY] || col.key,
      };
    }) as ColumnType[];

    return c;
  });

  React.useEffect(() => {
    if (columns) {
      const c = getColumns(columns);
      setResizableColumns(c);
    }
  }, [columns, getColumns, setResizableColumns]);

  useThrottleEffect(
    () => {
      const t = getColumns(resizableColumns);
      setResizableColumns(t);
    },
    [triggerRender],
    option,
  );

  React.useEffect(() => {
    let width = 0;

    (function loop(cls: ColumnType[]) {
      for (let i = 0; i < cls.length; i++) {
        width +=
          Number(cls[i].width) || Number(columns?.[columns.length - 1].width) || defaultWidth;
        if (cls[i].children) {
          loop(cls[i].children as ColumnType[]);
        }
      }
    })(resizableColumns);

    setTableWidth(width);
  }, [columns, defaultWidth, resizableColumns, setTableWidth]);

  const { run: debounceRender } = useDebounceFn(forceRender);

  React.useEffect(() => {
    window.addEventListener('resize', debounceRender);
    return () => {
      window.removeEventListener('resize', debounceRender);
    };
  }, [debounceRender]);

  const components = React.useMemo(() => {
    return {
      header: {
        cell: ResizableHeader,
      },
    };
  }, []);

  return {
    resizableColumns,
    components,
    tableWidth,
    resetColumns,
  };
}

export default useAntdResizableHeader;
