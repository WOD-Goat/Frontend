import { storage } from "@/components/lib/storage";
import type { RefreshTokenResponse } from "@/types/auth";
import type { ApiResponse } from "@/types/common";
import { API_ENDPOINTS } from "./endpoints";

const API_BASE_URL = "https://backend-s3j0.onrender.com";
const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

export class ApiClient {
  private baseURL: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private isInitialized: boolean = false;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.loadTokensFromStorage();
  }

  private async loadTokensFromStorage() {
    try {
      const [accessToken, refreshToken] = await Promise.all([
        storage.get(ACCESS_TOKEN_KEY),
        storage.get(REFRESH_TOKEN_KEY),
      ]);
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
    } catch (error) {
      console.error("Failed to load tokens from storage:", error);
    } finally {
      this.isInitialized = true;
    }
  }

  async waitForInitialization(): Promise<void> {
    while (!this.isInitialized) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }

  async setTokens(accessToken: string, refreshToken: string) {
    try {
      await Promise.all([
        storage.set(ACCESS_TOKEN_KEY, accessToken),
        storage.set(REFRESH_TOKEN_KEY, refreshToken),
      ]);
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
    } catch (error) {
      console.error("Failed to save tokens to storage:", error);
    }
  }

  async setAccessToken(token: string | null) {
    try {
      if (token) {
        await storage.set(ACCESS_TOKEN_KEY, token);
      } else {
        await storage.remove(ACCESS_TOKEN_KEY);
      }
      this.accessToken = token;
    } catch (error) {
      console.error("Failed to update access token in storage:", error);
    }
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  async clearTokens() {
    try {
      await Promise.all([
        storage.remove(ACCESS_TOKEN_KEY),
        storage.remove(REFRESH_TOKEN_KEY),
      ]);
    } catch (error) {
      console.error("Failed to clear tokens from storage:", error);
    }
    this.accessToken = null;
    this.refreshToken = null;
  }

  async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      return false;
    }

    try {
      const response = await fetch(
        `${this.baseURL}${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(this.accessToken && {
              Authorization: `Bearer ${this.accessToken}`,
            }),
          },
          body: JSON.stringify({ refreshToken: this.refreshToken }),
        },
      );

      if (!response.ok) {
        // Check if this is a 401
        if (response.status === 401 || this.refreshToken === null) {
          console.log("⚠️ Session expired, please log in again");
          await this.clearTokens();
          const { router } = await import("expo-router");
          router.push("/auth/login");
        }
        await this.clearTokens();
        return false;
      }

      const data: RefreshTokenResponse = await response.json();

      if (data.success && data.accessToken) {
        await this.setAccessToken(data.accessToken);
        console.log("✅ Access token refreshed successfully");
        return true;
      }

      await this.clearTokens();
      return false;
    } catch {
      await this.clearTokens();
      return false;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const makeRequest = async (
      token: string | null = this.accessToken,
    ): Promise<ApiResponse<T>> => {
      const config: RequestInit = {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      };

      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`,
        );
      }

      return data;
    };

    try {
      return await makeRequest();
    } catch (error) {
      // If we get a 401 or invalid token error and this isn't a refresh token request, try refreshing
      if (
        error instanceof Error &&
        (error.message.includes("401") ||
          error.message.toLowerCase().includes("invalid token")) &&
        !endpoint.includes("refresh-token") &&
        this.refreshToken
      ) {
        console.log(
          "🔄 API Client: Detected token error, attempting refresh...",
        );
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          console.log(
            "🔄 API Client: Token refreshed, retrying original request...",
          );
          // Retry the original request with the new token
          return await makeRequest();
        } else {
          console.log("🔄 API Client: Token refresh failed, tokens cleared");
          // Redirect is already handled in refreshAccessToken()
        }
      }

      throw new Error(error instanceof Error ? error.message : "Network error");
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
