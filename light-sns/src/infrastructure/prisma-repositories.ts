import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import { 
  IUserRepository, 
  IPostRepository, 
  IUserAuthRepository, 
  ISessionRepository,
  User,
  Post,
  UserAuth,
  Session
} from '../domain/types';

const prisma = new PrismaClient();

// Type transformations
function toDomainUser(prismaUser: any): User {
  return {
    id: prismaUser.id,
    createdAt: prismaUser.createdAt,
    userId: prismaUser.userId,
    userName: prismaUser.userName,
    description: prismaUser.description,
    iconUrl: prismaUser.iconUrl
  };
}

function toDomainPost(prismaPost: any): Post {
  return {
    id: prismaPost.id,
    createdAt: prismaPost.createdAt,
    userId: prismaPost.userId,
    body: prismaPost.body
  };
}

function toDomainUserAuth(prismaUserAuth: any): UserAuth {
  return {
    id: prismaUserAuth.id,
    createdAt: prismaUserAuth.createdAt,
    userId: prismaUserAuth.userId,
    password: prismaUserAuth.password,
    salt: prismaUserAuth.salt
  };
}

function toDomainSession(prismaSession: any): Session {
  return {
    id: prismaSession.id,
    createdAt: prismaSession.createdAt,
    userId: prismaSession.userId,
    UUID: prismaSession.UUID
  };
}

export class PrismaUserRepository implements IUserRepository {
  async findByUserId(userId: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { userId }
    });
    return user ? toDomainUser(user) : null;
  }

  async create(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const created = await prisma.user.create({
      data: user
    });
    return toDomainUser(created);
  }

  async update(
    userId: string, 
    data: Partial<Omit<User, 'id' | 'createdAt' | 'userId'>>
  ): Promise<User> {
    const updated = await prisma.user.update({
      where: { userId },
      data
    });
    return toDomainUser(updated);
  }
}

export class PrismaPostRepository implements IPostRepository {
  async create(post: Omit<Post, 'id' | 'createdAt'>): Promise<Post> {
    const created = await prisma.post.create({
      data: post
    });
    return toDomainPost(created);
  }

  async findByUserId(userId: string): Promise<Post[]> {
    const posts = await prisma.post.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    return posts.map(toDomainPost);
  }

  async getTimeline(limit: number = 20): Promise<Post[]> {
    const posts = await prisma.post.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' }
    });
    return posts.map(toDomainPost);
  }
}

export class PrismaUserAuthRepository implements IUserAuthRepository {
  async findByUserId(userId: string): Promise<UserAuth | null> {
    const userAuth = await prisma.userAuth.findUnique({
      where: { userId }
    });
    return userAuth ? toDomainUserAuth(userAuth) : null;
  }

  async create(auth: Omit<UserAuth, 'id' | 'createdAt'>): Promise<UserAuth> {
    const created = await prisma.userAuth.create({
      data: auth
    });
    return toDomainUserAuth(created);
  }
}

export class PrismaSessionRepository implements ISessionRepository {
  async create(userId: string): Promise<Session> {
    const created = await prisma.sessionIDs.create({
      data: {
        userId,
        UUID: randomUUID()
      }
    });
    return toDomainSession(created);
  }

  async findByUUID(UUID: string): Promise<Session | null> {
    const session = await prisma.sessionIDs.findUnique({
      where: { UUID }
    });
    return session ? toDomainSession(session) : null;
  }

  async delete(UUID: string): Promise<void> {
    await prisma.sessionIDs.delete({
      where: { UUID }
    });
  }
}
