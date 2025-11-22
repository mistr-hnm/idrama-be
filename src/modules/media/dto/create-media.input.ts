import { InputType, Field } from '@nestjs/graphql';
import { Upload } from '../scalar/media.scalar';

@InputType()
export class CreateMediaInput {
  @Field()
  key: string;

  @Field({ nullable: true })
  filename: string;

  @Field()
  url: string;
}
 
