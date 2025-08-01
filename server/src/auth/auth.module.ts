import { Module } from '@nestjs/common';
import { AuthService } from "./auth.service";
import { TestController } from "./test.controller";
import { JwtService } from "@nestjs/jwt";

@Module({
  providers: [JwtService, AuthService],
  controllers: [TestController],
  exports: [AuthService],
})
export class AuthModule {
}