import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media } from './entities/media.entity';
import { Upload } from '@aws-sdk/lib-storage'; 
import {
  S3Client,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import {
  CreateFileResponseDto,
  DeleteFileResponseDto,
  MediaDto,
  GetFileResponseDto,
  GetFilesResponseDto,
} from './dto/media.dto';

import { FileUpload } from 'graphql-upload';
@Injectable()
export class MediaService {
  private readonly s3Client: S3Client;
  private readonly s3BucketName: string;
  private readonly s3Region: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Media)
    private readonly mediaRepo: Repository<Media>,
  ) {
    this.s3BucketName = this.configService.getOrThrow<string>('S3_BUCKET_NAME');
    this.s3Region = this.configService.getOrThrow<string>('S3_REGION');

    this.s3Client = new S3Client({
      region: this.s3Region,
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>('S3_ACCESS_KEY'),
        secretAccessKey: this.configService.getOrThrow<string>(
          'S3_SECRET_ACCESS_KEY',
        ),
      },
    });
  }

  async uploadFile(file: FileUpload): Promise<CreateFileResponseDto> {
    try {
      const key = `videos/${Date.now()}-${file.filename}`; 
        console.log('📤 Starting video upload...');
        console.log('File size:', file.size || 'unknown');
        console.log('File type:', file.mimetype);
  
        // Get file stream or buffer
        const fileStream = file.createReadStream 
          ? file.createReadStream() 
          : Readable.from(file.buffer);
  
        // Use multipart upload for large files
        const upload = new Upload({
          client: this.s3Client,
          params: {
            Bucket: this.s3BucketName,
            Key: key,
            Body: fileStream,
            ContentType: file.mimetype || 'video/mp4',
            // Ensure proper caching
            CacheControl: 'public, max-age=31536000',
            // Add metadata
            Metadata: {
              originalName: file.filename,
              uploadedAt: new Date().toISOString(),
            },
          },
          // Enable multipart for files > 5MB
          queueSize: 4,
          partSize: 1024 * 1024 * 5, // 5MB parts
        });
  
        // Monitor progress
        upload.on('httpUploadProgress', (progress) => {
          const percent = ((progress.loaded / progress.total) * 100).toFixed(2);
          console.log(`Upload progress: ${percent}%`);
        });
  
        const result = await upload.done();
        
        const url = `https://${this.s3BucketName}.s3.${this.s3Region}.amazonaws.com/${key}`;
        
        console.log('✅ Upload complete:', url);
        console.log('ETag:', result.ETag);
        
        const newFile = this.mediaRepo.create({
          filename: file.filename,
          key: key,
          url: url,
        });  
        
        const savedFile = await this.mediaRepo.save(newFile); 
        if (!savedFile.id) {
          throw new BadRequestException(`File upload failed.`);
        }
  

      return {
        status: true,
        message: 'File uploaded successfully',
        data: {
          key: key,
          url: url,
          filename: file.filename,
          id: savedFile.id,
        },
      };
    } catch (error) {
      console.error('S3 Upload error:', error);
      throw new InternalServerErrorException(error?.message ?? "Something went wrong");
    }
  }

 
  async deleteFile(key: string): Promise<DeleteFileResponseDto> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.s3BucketName,
        Key: key,
      });
      await this.s3Client.send(command);

      await this.mediaRepo.delete({ key });

      return {
        status: true,
        message: 'File deleted successfully.',
      };
    } catch (error) {
      console.error('Delete error:', error);
      throw new InternalServerErrorException('Failed to delete file');
    }
  }

  async findById(id: string): Promise<GetFileResponseDto> {
    try {
      const file = await this.mediaRepo.findOne({ where: { id } });

      if (!file) {
        throw new NotFoundException(`File with id '${id}' not found.`);
      }

      return {
        status: true,
        message: 'File fetched successfully',
        data: file,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Find by id error for id ${id}:`, error);
      throw new InternalServerErrorException('Failed to fetch file');
    }
  }

  async findByKey(key: string): Promise<GetFileResponseDto> {
    try {
      const file = await this.mediaRepo.findOne({ where: { key } });

      if (!file) {
        throw new NotFoundException(`File with key '${key}' not found.`);
      }

      return {
        status: true,
        message: 'File fetched successfully',
        data: file,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Find by key error for key ${key}:`, error);
      throw new InternalServerErrorException('Failed to fetch file');
    }
  }

  async findAll(): Promise<GetFilesResponseDto> {
    try {
      const files = await this.mediaRepo.find()
      console.error(`Find all files:`, files);
      return {
        status: true,
        message: 'Files fetched successfully',
        data: files,
      };
    } catch (error) {
      console.error(`Find all error:`, error);
      throw new InternalServerErrorException('Failed to fetch files');
    }
  }

  async getObjectBuffer(key: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: this.s3BucketName,
      Key: key,
    });
    const response = await this.s3Client.send(command);
    const stream = response.Body as Readable;

    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }
}
