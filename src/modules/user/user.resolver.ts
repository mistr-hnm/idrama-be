import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UserService } from './user.service';
import { CreateUserInput } from './dto/create-user.input';
import { User } from './entities/user.entity';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) { }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => User)
  create(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.userService.create(createUserInput);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => [User])
  users() {
    return this.userService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => User)
  user(@Args('id', { type: () => ID }) id: string): Promise<User | null> {
    return this.userService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  removeuser(@Args('id', { type: () => ID }) id: string) : Promise<Boolean> {
    return this.userService.remove(id);
  }
}
