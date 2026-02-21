// Group Types

export interface Group {
  id?: string;
  name: string;
  createdBy: string;
  memberIds: string[];
  createdAt: Date;
}

// Group response types for API
export interface GroupResponse {
  success: boolean;
  data: Group;
  message?: string;
}

export interface GroupsResponse {
  success: boolean;
  data: Group[];
  message?: string;
}

// Group creation/update types
export interface CreateGroupData {
  name: string;
  memberIds?: string[];
}

export interface UpdateGroupData {
  name?: string;
  memberIds?: string[];
}

// Group member types
export interface GroupMember {
  uid: string;
  name: string;
  nickname: string;
  email: string;
  profilePictureUrl: string;
}

export interface GroupWithMembers extends Group {
  members: GroupMember[];
}
