import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {RestService} from '../common/rest.service';
import {User} from '@mean/shared/src/models/user';
import {MongoRepository} from "typeorm/repository/MongoRepository";

@Injectable()
export class UserService extends RestService<User> {

  constructor(@InjectRepository(User)
              private readonly usersRepository: MongoRepository<User>) {
    super(User, usersRepository);
  }

}