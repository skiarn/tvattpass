export interface JoinRequest {
  userId: string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  createdAt?: Date;
}

export interface Association {
  id: string;
  name: string;
  admins: string[];
  members: string[];
  joinRequests?: JoinRequest[];
  [key: string]: unknown;
}
