// auth.guard.ts
import { CanActivate, ExecutionContext, Injectable, SetMetadata, UnauthorizedException, } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from "./auth.service";
import { Reflector } from "@nestjs/core";

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private reflector: Reflector
  ) {
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!await this.isPublic(context)) {
      const request = context.switchToHttp().getRequest();
      const token = this.extractTokenFromHeader(request);

      let tokenPayload = await this.authService.verifyToken(token);
      request.user = tokenPayload.sub;
    }
    return true;
  }

  private async isPublic(context: ExecutionContext) {
    return this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);