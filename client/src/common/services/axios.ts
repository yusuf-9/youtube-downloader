import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

class AxiosService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_BACKEND_BASE_URL,
    });
  }

  // GET request method
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      const response = await this.axiosInstance.get<T>(url, config);
      return response;
    } catch (error) {
      if (this.isAxiosError(error)) {
        throw error as AxiosError;
      }
      throw error as unknown;
    }
  }

  // POST request method
  public async post<T>(url: string, data: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      const response = await this.axiosInstance.post<T>(url, data, config);
      return response;
    } catch (error) {
      if (this.isAxiosError(error)) {
        throw error as AxiosError;
      }
      throw error as unknown;
    }
  }

  // Type guard to check if error is an AxiosError
  isAxiosError(error: unknown): error is AxiosError {
    return (error as AxiosError).isAxiosError !== undefined;
  }
}

const instance = new AxiosService();
export default instance;
