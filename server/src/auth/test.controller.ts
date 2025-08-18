import { Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Public } from "./auth.guard";
import {User} from "@mean/shared/models/user";

@Controller("test")
export class TestController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post("sso/lending/token")
  async token(): Promise<{}> {
    return {
      token: await this.authService.createToken({
        name:{
          first: "Hi",
          last: "User",
        }
      } as User),
    };
  }
}
