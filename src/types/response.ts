export interface ApiResponse<T = unknown> {
  message: string;
  code: number;
  data: T;
}
