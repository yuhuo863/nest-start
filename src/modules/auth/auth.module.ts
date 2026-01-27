import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { userProviders } from '../user/user.providers';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [AuthService, ...userProviders],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
