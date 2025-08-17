import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { User } from "@mean/shared/src/models/user";
import { ConfigService } from "@nestjs/config";
import { createPrivateKey, createPublicKey, KeyObject } from "crypto";

@Injectable()
export class AuthService {
  private readonly privateKey: KeyObject;
  private readonly publicKey: string | Buffer;

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.privateKey = createPrivateKey({
      key: Buffer.from(
        this.configService.get<string>("JWT_PRIVATE_KEY"),
        "base64",
      ),
      format: "der",
      type: "pkcs8",
    });

    this.publicKey = createPublicKey({
      key: Buffer.from(
        this.configService.get<string>("JWT_PUBLIC_KEY"),
        "base64",
      ),
      format: "der",
      type: "spki",
    }).export({ format: "pem", type: "spki" });
  }

  async verifyToken<T extends object = any>(token: string): Promise<T> {
    if (!token) {
      if (this.configService.get<boolean>("IS_DEV")) {
        return {
          sub: "test",
        } as T;
      }
      throw new UnauthorizedException("No token provided");
    }

    try {
      return await this.jwtService.verifyAsync(token, {
        publicKey: this.publicKey,
        algorithms: ["RS256"],
      });
    } catch (error) {
      Logger.error(error);
      throw new UnauthorizedException("Invalid token");
    }
  }

  async createToken(user: User): Promise<string> {
    if (!user) {
      throw new UnauthorizedException("Invalid user");
    }

    try {
      const expiresIn = 360;
      const iat = Date.now() / 1000;
      return await this.jwtService.signAsync(
        {
          iss: this.configService.get<string>('APP_NAME') || 'App',
          iat,
          ...user,
        },
        {
          privateKey: this.privateKey,
          algorithm: "RS256",
          expiresIn: expiresIn,
        },
      );
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException("Failed to generate token");
    }
  }
}
