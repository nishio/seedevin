import { IPostRepository, Post } from '../../domain/types';
import { ValidationError } from '../../domain/types';

export interface GetTimelineInput {
  limit?: number;
}

export interface GetTimelineOutput {
  success: boolean;
  posts?: Post[];
  error?: string;
}

export class GetTimelineUseCase {
  constructor(
    private postRepository: IPostRepository
  ) {}

  async execute(input: GetTimelineInput): Promise<GetTimelineOutput> {
    try {
      const posts = await this.postRepository.getTimeline(input.limit);

      return {
        success: true,
        posts
      };
    } catch (error) {
      throw new ValidationError('Get timeline failed: ' + (error as Error).message);
    }
  }
}
