import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class MediaDto {
  @Field(() => ID)
  id: string;

  @Field()
  key: string;

  @Field()
  url: string;

  @Field()
  filename: string;
}

@ObjectType()
export class CreateFileResponseDto {
  @Field()
  status: boolean;

  @Field()
  message: string;

  @Field(() => MediaDto)
  data: MediaDto;
}

@ObjectType()
export class GetFileResponseDto {
  @Field()
  status: boolean;

  @Field()
  message: string;

  @Field(() => MediaDto)
  data: MediaDto;
}

@ObjectType()
export class DeleteFileResponseDto {
  @Field()
  status: boolean;

  @Field()
  message: string;
}

@ObjectType()
export class GetFilesResponseDto {
  @Field()
  status: boolean;

  @Field()
  message: string;

  @Field(() => [MediaDto])
  data: MediaDto[];
}
