export interface User {
  id: string;
  email: string;
  verified: boolean;
  tenantId: string;
  teamId?: string;
  team?: Team;
  createdAt: string;
  updatedAt: string;
  userGroups?: UserGroup[];
}

export interface Tenant {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  name: string;
  tenantId: string;
  users?: User[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    users?: number;
    groups?: number;
  };
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Record<Module, Permission[]>;
  createdAt: string;
  updatedAt: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  teamId: string;
  team: Team;
  groupRoles: GroupRole[];
  userGroups: UserGroup[];
  createdAt: string;
  updatedAt: string;
}

export interface GroupRole {
  id: string;
  groupId: string;
  roleId: string;
  role: Role;
}

export interface UserGroup {
  id: string;
  userId: string;
  groupId: string;
  user: User;
  group: Group;
}

export interface Secret {
  id: string;
  name: string;
  value: string;
  teamId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  teamId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Report {
  id: string;
  title: string;
  content: string;
  teamId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type Module = "vault" | "financials" | "reporting";
export type Permission = "create" | "read" | "update" | "delete";
export type UserPermissions = Record<Module, Permission[]>;

export interface ApiResponse<T = any> {
  error?: string;
  message?: string;
  details?: string;
  [key: string]: any;
}
