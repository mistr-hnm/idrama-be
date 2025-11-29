import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MediaService } from './media.service';
import {
  CreateFileResponseDto,
  DeleteFileResponseDto,
  GetFileResponseDto,
} from './dto/media.dto';
import { GraphQLUpload, FileUpload } from 'graphql-upload';

@Resolver()
export class MediaResolver {
  constructor(private readonly mediaService: MediaService) {}

  @Mutation(() => CreateFileResponseDto)
  // @UseGuards(JwtAuthGuard)
  async uploadFile(
    @Args({ name: 'file', type: () => GraphQLUpload })
    file: FileUpload,
  ): Promise<CreateFileResponseDto> {
    return this.mediaService.uploadFile(file);
  }
 

  @Query(() => GetFileResponseDto)
  // @UseGuards(JwtAuthGuard)
  async getPresignedUrl(
    @Args('key') key: string,
  ): Promise<GetFileResponseDto> {
    return this.mediaService.getPresignedUrl(key);
  }

  @Mutation(() => DeleteFileResponseDto)
  // @UseGuards(JwtAuthGuard)
  async deleteFile(@Args('key') key: string): Promise<DeleteFileResponseDto> {
    return this.mediaService.deleteFile(key);
  }

  @Query(() => GetFileResponseDto)
  // @UseGuards(JwtAuthGuard)
  async fileById(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<GetFileResponseDto> {
    return this.mediaService.findById(id);
  }

  @Query(() => GetFileResponseDto)
  // @UseGuards(JwtAuthGuard)
  async fileByKey(@Args('key') key: string): Promise<GetFileResponseDto> {
    return this.mediaService.findByKey(key);
  }
}
