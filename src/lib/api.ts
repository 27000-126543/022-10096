const BASE_URL = '/api';

interface RequestOptions extends RequestInit {
  params?: Record<string, any>;
  timeout?: number;
}

export interface ApiResult<T = any> {
  code: number;
  message: string;
  data: T;
  total?: number;
  page?: number;
  pageSize?: number;
  success?: boolean;
}

function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, v));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

export async function request<T = any>(
  url: string,
  options: RequestOptions = {}
): Promise<ApiResult<T>> {
  const { params, timeout = 30000, headers, ...rest } = options;
  const fullUrl = `${BASE_URL}${url}${params ? buildQueryString(params) : ''}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(fullUrl, {
      ...rest,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return {
      code: result.code ?? (result.success ? 0 : 1),
      message: result.message ?? (result.success ? '操作成功' : '操作失败'),
      data: result.data ?? result,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      success: result.success ?? result.code === 0,
    };
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      return {
        code: -1,
        message: '请求超时，请重试',
        data: null as T,
        success: false,
      };
    }
    return {
      code: -1,
      message: error.message || '网络错误，请检查连接',
      data: null as T,
      success: false,
    };
  }
}

export const api = {
  get: <T = any>(url: string, params?: Record<string, any>, options?: RequestOptions) =>
    request<T>(url, { ...options, method: 'GET', params }),

  post: <T = any>(url: string, body?: any, options?: RequestOptions) =>
    request<T>(url, { ...options, method: 'POST', body: body ? JSON.stringify(body) : undefined }),

  put: <T = any>(url: string, body?: any, options?: RequestOptions) =>
    request<T>(url, { ...options, method: 'PUT', body: body ? JSON.stringify(body) : undefined }),

  delete: <T = any>(url: string, options?: RequestOptions) =>
    request<T>(url, { ...options, method: 'DELETE' }),
};

export default api;
