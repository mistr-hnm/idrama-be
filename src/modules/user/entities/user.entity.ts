import { Entity, Column } from 'typeorm';
import { ObjectType, Field, registerEnumType } from '@nestjs/graphql';
import { BaseSchema } from '../../../core/meta/base.schema';

export enum USERTYPE {
  USER = 'USER',
  ADMIN = 'ADMIN',
}
registerEnumType(USERTYPE, {
  name: 'USERTYPE',
});

@ObjectType()
@Entity()
export class User extends BaseSchema {
  @Field()
  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Field()
  @Column({ type: 'varchar', nullable: false })
  email: string;

  @Field()
  @Column({ type: 'varchar', nullable: true })
  password: string;

  @Field()
  @Column({ type: 'varchar', nullable: true })
  description: string;

  @Field(() => USERTYPE)
  @Column({
    type: 'enum',
    enum: USERTYPE,
    nullable: false,
    default: USERTYPE.USER,
  })
  usertype: USERTYPE;
}
