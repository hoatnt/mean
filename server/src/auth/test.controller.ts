import { Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { User } from "direct-lending-shared/src/models/user";
import { Public } from "./auth.guard";

@Controller("test")
export class TestController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post("sso/lending/token")
  async token(): Promise<{}> {
    return {
      token: await this.authService.createToken({
        first_name: "Hi",
        last_name: "User",
      } as User),
    };
  }
}
