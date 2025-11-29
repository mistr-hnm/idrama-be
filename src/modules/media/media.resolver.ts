import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { BadRequestException, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MediaService } from './media.service';
import {
  CreateFileResponseDto,
  DeleteFileResponseDto,
  GetFileResponseDto,
  GetFilesResponseDto,
} from './dto/media.dto';
import { GraphQLUpload, FileUpload } from 'graphql-upload';
import { AuthGuard } from '@nestjs/passport';

@Resolver()
export class MediaResolver {
  constructor(private readonly mediaService: MediaService) {}

  @Mutation(() => CreateFileResponseDto)
  @UseGuards(JwtAuthGuard)
  async uploadFile(
    @Args({ name: 'file', type: () => GraphQLUpload })
    file: FileUpload,
  ): Promise<CreateFileResponseDto> {
    console.log('📥 Received file upload request');
    console.log('Filename:', file.filename);
    console.log('Mimetype:', file.mimetype);
    console.log('Encoding:', file.encoding);

    // Validate file type
    const allowedMimeTypes = [
      'video/mp4',
      'video/quicktime', // .mov
      'video/x-msvideo', // .avi
      'video/webm',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type: ${file.mimetype}. Allowed types: ${allowedMimeTypes.join(', ')}`
      );
    }

    // Validate file extension
    const validExtensions = ['.mp4', '.mov', '.avi', '.webm'];
    const fileExt = file.filename.toLowerCase().match(/\.[^.]+$/)?.[0];
    
    if (!fileExt || !validExtensions.includes(fileExt)) {
      throw new BadRequestException(
        `Invalid file extension. Allowed: ${validExtensions.join(', ')}`
      );
    }

    try {
      // Read the file stream
      const { createReadStream, filename, mimetype } = file;
      const stream = createReadStream();

      // Collect file data
      const chunks: Buffer[] = [];
      
      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      const buffer = Buffer.concat(chunks);
      const fileSize = buffer.length;

      console.log('📊 File size:', (fileSize / 1024 / 1024).toFixed(2), 'MB');

      // Check file size (max 100MB for example)
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (fileSize > maxSize) {
        throw new BadRequestException(
          `File too large: ${(fileSize / 1024 / 1024).toFixed(2)}MB. Max: 100MB`
        );
      }

      // Check minimum size (videos should be at least 1KB)
      if (fileSize < 1024) {
        throw new BadRequestException('File too small or corrupted');
      }

      // Verify it's actually a video by checking file signature
      const signature = buffer.slice(0, 12).toString('hex');
      console.log('File signature:', signature);

      // MP4 signature check (starts with ftyp)
      const isMp4 = buffer.slice(4, 8).toString() === 'ftyp';
      
      if (mimetype === 'video/mp4' && !isMp4) {
        throw new BadRequestException('File appears to be corrupted or not a valid MP4');
      }

      // Upload to S3
      const url = await this.mediaService.uploadFile({
        buffer,
        filename,
        mimetype,
        size: fileSize,
      });

      return url;
    } catch (error) {
      console.error('❌ Upload error:', error);
      throw error;
    }
  
  }
  
  @Mutation(() => DeleteFileResponseDto)
  @UseGuards(JwtAuthGuard)
  async deleteFile(@Args('key') key: string): Promise<DeleteFileResponseDto> {
    return this.mediaService.deleteFile(key);
  }

  @Query(() => GetFileResponseDto)
  @UseGuards(JwtAuthGuard)
  async fileById(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<GetFileResponseDto> {
    return this.mediaService.findById(id);
  }

  @Query(() => GetFileResponseDto)
  @UseGuards(JwtAuthGuard)
  async fileByKey(@Args('key') key: string): Promise<GetFileResponseDto> {
    return this.mediaService.findByKey(key);
  }

  @Query(() => GetFilesResponseDto)
  @UseGuards(JwtAuthGuard)
  async files(): Promise<GetFilesResponseDto> {
    return this.mediaService.findAll();
  }
}
