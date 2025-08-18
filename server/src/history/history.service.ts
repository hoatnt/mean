import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm/repository/MongoRepository';
import { History } from '@mean/shared/models/history';
import { RestService } from '../common/rest.service';

@Injectable()
export class HistoryService extends RestService<History> {
  constructor(
    @InjectRepository(History)
    private readonly repository: MongoRepository<History>
  ) {
    super(History, repository);
  }
}
