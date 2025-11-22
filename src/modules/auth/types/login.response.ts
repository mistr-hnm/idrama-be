import { Field, ObjectType } from '@nestjs/graphql';
import { User } from 'src/modules/user/entities/user.entity';

@ObjectType()
export class LoginResponse {
   
  
  @Field()
  access_token: string;

  @Field(() => User, { nullable: true })
  user?: User;

}
