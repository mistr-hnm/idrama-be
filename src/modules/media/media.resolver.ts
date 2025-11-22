import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
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

  @Mutation(() => Boolean)
  async uploadImages(
    @Args({ name: 'images', type: () => [GraphQLUpload] })
    images: Promise<FileUpload[]>,
  ) {
    console.log(await images);
    return true;
  }

}
