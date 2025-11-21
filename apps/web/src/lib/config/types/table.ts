/**
 * Table/Grid Configuration Types
 * Config-driven tables, data grids, and lists
 */

export type ColumnType =
  | 'text'
  | 'number'
  | 'date'
  | 'datetime'
  | 'boolean'
  | 'badge'
  | 'avatar'
  | 'actions'
  | 'custom';

export type ColumnAlign = 'left' | 'center' | 'right';

export type SortDirection = 'asc' | 'desc';

export type FilterType =
  | 'text'
  | 'select'
  | 'date-range'
  | 'number-range'
  | 'boolean'
  | 'multi-select';

export type ColumnFilter = {
  type: FilterType;
  options?: { label: string; value: any }[];
  placeholder?: string;
  defaultValue?: any;
};

export type RowAction = {
  id: string;
  label: string;
  icon?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'ghost';
  onClick: string; // Function name
  disabled?: (row: any) => boolean;
  hidden?: (row: any) => boolean;
  confirm?: {
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
  };
};

export type Column = {
  id: string;
  key: string; // Data key
  label: string;
  type: ColumnType;
  align?: ColumnAlign;
  width?: number | string;
  minWidth?: number;
  maxWidth?: number;
  sortable?: boolean;
  filterable?: boolean;
  filter?: ColumnFilter;
  hidden?: boolean;
  render?: string; // Custom render function name
  badge?: {
    variants: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'destructive' | 'info'>;
  };
  format?: {
    type: 'currency' | 'percentage' | 'number' | 'date' | 'datetime' | 'relative-time';
    options?: Intl.NumberFormatOptions | Intl.DateTimeFormatOptions;
  };
};

export type BulkAction = {
  id: string;
  label: string;
  icon?: string;
  variant?: 'default' | 'destructive' | 'outline';
  onClick: string; // Function name
  confirm?: {
    title: string;
    description: string;
  };
};

export type TablePagination = {
  enabled: boolean;
  pageSize: number;
  pageSizeOptions?: number[];
  showTotal?: boolean;
  position?: 'top' | 'bottom' | 'both';
};

export type TableSelection = {
  enabled: boolean;
  mode: 'single' | 'multiple';
  showSelectAll?: boolean;
};

export type TableConfig = {
  id: string;
  title?: string;
  description?: string;
  columns: Column[];
  dataSource: {
    type: 'api' | 'static' | 'function';
    endpoint?: string; // For API
    data?: any[]; // For static
    fetchFunction?: string; // For function
    method?: 'GET' | 'POST';
    params?: Record<string, any>;
  };
  rowActions?: RowAction[];
  bulkActions?: BulkAction[];
  selection?: TableSelection;
  pagination?: TablePagination;
  sorting?: {
    enabled: boolean;
    defaultSort?: {
      column: string;
      direction: SortDirection;
    };
    serverSide?: boolean;
  };
  filtering?: {
    enabled: boolean;
    serverSide?: boolean;
    searchEnabled?: boolean;
    searchPlaceholder?: string;
    searchColumns?: string[]; // Columns to search
  };
  export?: {
    enabled: boolean;
    formats: ('csv' | 'excel' | 'pdf' | 'json')[];
    filename?: string;
  };
  refresh?: {
    enabled: boolean;
    interval?: number; // Auto-refresh interval in ms
  };
  emptyState?: {
    title: string;
    description?: string;
    icon?: string;
    action?: {
      label: string;
      onClick: string;
    };
  };
  loading?: {
    type: 'skeleton' | 'spinner' | 'custom';
    rows?: number;
  };
  responsive?: {
    mobile?: 'cards' | 'horizontal-scroll' | 'stack';
    breakpoint?: number;
  };
  density?: 'compact' | 'normal' | 'comfortable';
  striped?: boolean;
  bordered?: boolean;
  hoverable?: boolean;
  className?: string;
};

export type TableState = {
  data: any[];
  loading: boolean;
  error?: string;
  selectedRows: Set<string | number>;
  currentPage: number;
  pageSize: number;
  totalRows: number;
  sortColumn?: string;
  sortDirection?: SortDirection;
  filters: Record<string, any>;
  searchQuery?: string;
};
