// Domain types for light-sns entities

export interface User {
  id: bigint;
  createdAt: Date;
  userId: string | null;
  userName: string | null;
  description: string | null;
  iconUrl: string | null;
}

export interface Post {
  id: bigint;
  createdAt: Date;
  userId: string | null;
  body: string | null;
}

export interface UserAuth {
  id: bigint;
  createdAt: Date;
  userId: string | null;
  password: string | null;
  salt: string | null;
}

export interface Session {
  id: bigint;
  createdAt: Date;
  userId: string;
  UUID: string;
}

// Domain errors
export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Domain interfaces
export interface IUserRepository {
  findByUserId(userId: string): Promise<User | null>;
  create(user: Omit<User, 'id' | 'createdAt'>): Promise<User>;
  update(userId: string, data: Partial<Omit<User, 'id' | 'createdAt' | 'userId'>>): Promise<User>;
}

export interface IPostRepository {
  create(post: Omit<Post, 'id' | 'createdAt'>): Promise<Post>;
  findByUserId(userId: string): Promise<Post[]>;
  getTimeline(limit?: number): Promise<Post[]>;
}

export interface IUserAuthRepository {
  findByUserId(userId: string): Promise<UserAuth | null>;
  create(auth: Omit<UserAuth, 'id' | 'createdAt'>): Promise<UserAuth>;
}

export interface ISessionRepository {
  create(userId: string): Promise<Session>;
  findByUUID(UUID: string): Promise<Session | null>;
  delete(UUID: string): Promise<void>;
}
