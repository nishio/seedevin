import { IPostRepository } from '../../domain/types';
import { ValidationError } from '../../domain/types';

export interface CreatePostInput {
  userId: string;
  body: string;
}

export interface CreatePostOutput {
  success: boolean;
  error?: string;
}

export class CreatePostUseCase {
  constructor(
    private postRepository: IPostRepository
  ) {}

  async execute(input: CreatePostInput): Promise<CreatePostOutput> {
    try {
      if (!input.body.trim()) {
        return {
          success: false,
          error: 'Post body cannot be empty'
        };
      }

      await this.postRepository.create({
        userId: input.userId,
        body: input.body
      });

      return {
        success: true
      };
    } catch (error) {
      throw new ValidationError('Create post failed: ' + (error as Error).message);
    }
  }
}
