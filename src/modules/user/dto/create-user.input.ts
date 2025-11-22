import { InputType, Field } from '@nestjs/graphql';
import { USERTYPE } from '../entities/user.entity';

@InputType()
export class CreateUserInput {
  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  password: string;

  @Field({ nullable: true })
  description: string;

  @Field(() => USERTYPE, { nullable: true })
  usertype: USERTYPE;
}
