/**
 * Dashboard Configuration Types
 * Config-driven dashboards and widgets
 */

export type WidgetSize =
  | 'small'    // 1x1
  | 'medium'   // 2x1
  | 'large'    // 2x2
  | 'wide'     // 3x1 or 4x1
  | 'full';    // Full width

export type ChartType =
  | 'line'
  | 'bar'
  | 'pie'
  | 'doughnut'
  | 'area'
  | 'scatter'
  | 'radar';

export type StatTrend = 'up' | 'down' | 'neutral';

export type WidgetDataSource = {
  type: 'api' | 'static' | 'function' | 'realtime';
  endpoint?: string;
  method?: 'GET' | 'POST';
  params?: Record<string, any>;
  data?: any;
  fetchFunction?: string;
  refreshInterval?: number; // Auto-refresh in ms
  wsEndpoint?: string; // WebSocket for realtime
};

export type StatWidget = {
  type: 'stat';
  label: string;
  value: number | string;
  format?: 'number' | 'currency' | 'percentage';
  icon?: string;
  trend?: {
    value: number;
    direction: StatTrend;
    label?: string;
  };
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'destructive' | 'info';
  onClick?: string;
};

export type ChartWidget = {
  type: 'chart';
  chartType: ChartType;
  title?: string;
  dataSource: WidgetDataSource;
  options?: {
    xAxis?: string;
    yAxis?: string | string[];
    legend?: boolean;
    tooltip?: boolean;
    colors?: string[];
    height?: number;
  };
};

export type ListWidget = {
  type: 'list';
  title?: string;
  dataSource: WidgetDataSource;
  itemTemplate: {
    title: string; // Field name or template
    subtitle?: string;
    avatar?: string;
    badge?: string;
    timestamp?: string;
    onClick?: string;
  };
  emptyState?: {
    title: string;
    description?: string;
  };
  showMore?: {
    enabled: boolean;
    onClick?: string;
    label?: string;
  };
};

export type TableWidget = {
  type: 'table';
  title?: string;
  dataSource: WidgetDataSource;
  columns: {
    key: string;
    label: string;
    render?: string;
  }[];
  maxRows?: number;
  showMore?: {
    enabled: boolean;
    href?: string;
  };
};

export type ProgressWidget = {
  type: 'progress';
  title?: string;
  items: {
    label: string;
    value: number;
    total: number;
    color?: string;
  }[];
};

export type CalendarWidget = {
  type: 'calendar';
  title?: string;
  dataSource: WidgetDataSource;
  view?: 'month' | 'week' | 'day';
  eventTemplate?: {
    title: string;
    time?: string;
    color?: string;
  };
};

export type CustomWidget = {
  type: 'custom';
  component: string; // Component name to render
  props?: Record<string, any>;
};

export type Widget = {
  id: string;
  size: WidgetSize;
  permissions?: {
    roles?: string[];
    permissions?: string[];
  };
  refreshable?: boolean;
  removable?: boolean;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
} & (StatWidget | ChartWidget | ListWidget | TableWidget | ProgressWidget | CalendarWidget | CustomWidget);

export type DashboardLayout = {
  type: 'grid' | 'masonry' | 'custom';
  columns?: number; // For grid layout
  gap?: number;
  responsive?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
};

export type DashboardSection = {
  id: string;
  title?: string;
  description?: string;
  widgets: Widget[];
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  permissions?: {
    roles?: string[];
    permissions?: string[];
  };
};

export type DashboardConfig = {
  id: string;
  title: string;
  description?: string;
  layout: DashboardLayout;
  sections: DashboardSection[];
  filters?: {
    dateRange?: boolean;
    customFilters?: {
      id: string;
      label: string;
      type: 'select' | 'date' | 'text';
      options?: { label: string; value: any }[];
      defaultValue?: any;
    }[];
  };
  export?: {
    enabled: boolean;
    formats: ('pdf' | 'image' | 'json')[];
  };
  refresh?: {
    enabled: boolean;
    interval?: number;
    manual?: boolean;
  };
  customization?: {
    allowReorder?: boolean;
    allowResize?: boolean;
    allowAdd?: boolean;
    allowRemove?: boolean;
    savePreferences?: boolean;
  };
};
