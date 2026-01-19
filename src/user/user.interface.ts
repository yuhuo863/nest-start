export interface UserData {
  username: string;
  email: string;
  token: string;
  bio: string;
  avatar?: string;
}

export interface UserRO {
  user: UserData;
}

export interface UserPayload {
  id: number;
  username: string;
  email: string;
}
