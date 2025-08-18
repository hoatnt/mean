import { Controller } from '@nestjs/common';
import { RestController } from '../common/rest.controller';
import { HistoryService } from './history.service';
import { History } from '@mean/shared/src/models/history';

@Controller('histories')
export class HistoryController extends RestController<History> {
  constructor(readonly service: HistoryService) {
    super(service);
  }
}
