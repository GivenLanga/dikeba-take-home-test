import {
  ApiResponse,
  User,
  Tenant,
  Team,
  Role,
  Group,
  Secret,
  Module,
  Permission,
  Transaction,
} from "../types";

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = "http://localhost:3000") {
    this.baseURL = baseURL;
  }

  public async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include", // Important for session cookies
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Auth endpoints
  auth = {
    register: (email: string, tenantId: string) =>
      this.request("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, tenantId }),
      }),

    requestOtp: (email: string) =>
      this.request("/auth/request-otp", {
        method: "POST",
        body: JSON.stringify({ email }),
      }),

    verifyOtp: (email: string, code: string) =>
      this.request("/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email, code }),
      }),

    logout: () => this.request("/auth/logout", { method: "POST" }),
  };

  // Admin endpoints
  admin = {
    getUnverifiedUsers: () =>
      this.request<{ users: User[] }>("/admin/unverified-users"),
    verifyUser: (userId: string) =>
      this.request("/admin/verify-user", {
        method: "POST",
        body: JSON.stringify({ userId }),
      }),
  };

  // Management endpoints
  tenants = {
    getAll: () => this.request<{ tenants: Tenant[] }>("/tenants"),
    create: (name: string) =>
      this.request<{ tenant: Tenant }>("/tenants", {
        method: "POST",
        body: JSON.stringify({ name }),
      }),
  };

  users = {
    getAll: () => this.request<{ users: User[] }>("/users"),
    update: (id: string, data: Partial<User>) =>
      this.request<{ user: User }>(`/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) => this.request(`/users/${id}`, { method: "DELETE" }),
  };

  teams = {
    getAll: () => this.request<{ teams: Team[] }>("/teams"),
    create: (name: string) =>
      this.request<{ team: Team }>("/teams", {
        method: "POST",
        body: JSON.stringify({ name }),
      }),
    update: (id: string, name: string) =>
      this.request<{ team: Team }>(`/teams/${id}`, {
        method: "PUT",
        body: JSON.stringify({ name }),
      }),
    delete: (id: string) => this.request(`/teams/${id}`, { method: "DELETE" }),
  };

  roles = {
    getAll: () => this.request<{ roles: Role[] }>("/roles"),
    create: (
      name: string,
      description: string,
      permissions: Record<Module, Permission[]>
    ) =>
      this.request<{ role: Role }>("/roles", {
        method: "POST",
        body: JSON.stringify({ name, description, permissions }),
      }),
    update: (id: string, data: Partial<Role>) =>
      this.request<{ role: Role }>(`/roles/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) => this.request(`/roles/${id}`, { method: "DELETE" }),
  };

  groups = {
    getAll: () => this.request<{ groups: Group[] }>("/groups"),
    create: (name: string, description: string, teamId: string) =>
      this.request<{ group: Group }>("/groups", {
        method: "POST",
        body: JSON.stringify({ name, description, teamId }),
      }),
    update: (id: string, data: Partial<Group>) =>
      this.request<{ group: Group }>(`/groups/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) => this.request(`/groups/${id}`, { method: "DELETE" }),
    addUser: (groupId: string, userId: string) =>
      this.request(`/groups/${groupId}/users`, {
        method: "POST",
        body: JSON.stringify({ userId }),
      }),
    removeUser: (groupId: string, userId: string) =>
      this.request(`/groups/${groupId}/users/${userId}`, { method: "DELETE" }),
    addRole: (groupId: string, roleId: string) =>
      this.request(`/groups/${groupId}/roles`, {
        method: "POST",
        body: JSON.stringify({ roleId }),
      }),
    removeRole: (groupId: string, roleId: string) =>
      this.request(`/groups/${groupId}/roles/${roleId}`, { method: "DELETE" }),
  };

  // Module endpoints
  vault = {
    getAll: (teamId: string) =>
      this.request<{ secrets: Secret[] }>(`/vault?teamId=${teamId}`),
    create: (name: string, value: string, teamId: string) =>
      this.request<{ secret: Secret }>("/vault", {
        method: "POST",
        body: JSON.stringify({ name, value, teamId }),
      }),
    update: (id: string, data: Partial<Secret>) =>
      this.request<{ secret: Secret }>(`/vault/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) => this.request(`/vault/${id}`, { method: "DELETE" }),
  };

  financials = {
    getAll: (teamId: string) =>
      this.request<{ transactions: Transaction[] }>(
        `/financials?teamId=${teamId}`
      ),
    create: (amount: number, description: string, teamId: string) =>
      this.request<{ transaction: Transaction }>("/financials", {
        method: "POST",
        body: JSON.stringify({ amount, description, teamId }),
      }),
    update: (id: string, data: Partial<Transaction>) =>
      this.request<{ transaction: Transaction }>(`/financials/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      this.request(`/financials/${id}`, { method: "DELETE" }),
  };

  reporting = {
    getAll: (teamId: string) =>
      this.request<{ reports: Report[] }>(`/reporting?teamId=${teamId}`),
    create: (title: string, content: string, teamId: string) =>
      this.request<{ report: Report }>("/reporting", {
        method: "POST",
        body: JSON.stringify({ title, content, teamId }),
      }),
    update: (id: string, data: { title?: string; content?: string }) =>
      this.request<{ report: Report }>(`/reporting/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      this.request(`/reporting/${id}`, { method: "DELETE" }),
  };
}

export const api = new ApiClient();
