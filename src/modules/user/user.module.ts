import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthGuard } from './guards/auth.guard';
import { userProviders } from './user.providers';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [UserService, AuthGuard, ...userProviders],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
