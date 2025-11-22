import { Entity, Column } from 'typeorm';
import { ObjectType, Field } from '@nestjs/graphql';
import { BaseSchema } from '../../../core/meta/base.schema';

@ObjectType()
@Entity()
export class Media extends BaseSchema {
  @Field()
  @Column({ type: 'varchar', nullable: false })
  key: string;

  @Field()
  @Column({ type: 'varchar', nullable: true })
  filename: string;

  @Field()
  @Column({ type: 'varchar', nullable: false })
  url: string;
}
