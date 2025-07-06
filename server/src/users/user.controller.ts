import { Controller } from '@nestjs/common';
import { RestController } from '../common/rest.controller';
import { UserService } from './user.service';
import {User} from "@mean/shared/src/models/user";

@Controller('users')
export class UserController extends RestController<User> {

    constructor(readonly service: UserService) {
        super(service);
    }

}