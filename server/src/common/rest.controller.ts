import { ListParams, RestService } from "./rest.service";
import {
    Body,
    Delete,
    Get,
    HttpStatus,
    Param,
    Patch,
    Post,
    Put,
    Query,
    Res,
} from "@nestjs/common";
import { Response } from "express";
import {Model} from "@mean/shared/src/models/model";

export abstract class RestController<M extends Model> {
    protected constructor(readonly service: RestService<M>) {}

    @Get()
    async list(
      @Query() query: ListParams<M>,
      @Res({ passthrough: true }) res: Response,
    ): Promise<M[]> {
        const [data, total] = await this.service.list(query);
        if (!!total) {
            res.header("x-pagination-total", `${total}`);
            res.header("Access-Control-Expose-Headers", "x-pagination-total");
        }
        return data;
    }

    @Get(":id")
    async get(@Param("id") id: string): Promise<M> {
        return this.service.get(id);
    }

    @Post()
    async create(@Body() item: M): Promise<M> {
        return this.service.create(item);
    }

    @Put(":id")
    async replace(@Param("id") id: string, @Body() item: M): Promise<M> {
        return this.service.replace(id, item);
    }

    @Patch(":id")
    async update(@Param("id") id: string, @Body() item: M): Promise<M> {
        return this.service.update(id, item);
    }

    @Delete(":id")
    async delete(@Param("id") id: string, @Res() res: Response) {
        res
          .status(
            (await this.service.delete(id))
              ? HttpStatus.NO_CONTENT
              : HttpStatus.NOT_FOUND,
          )
          .send();
    }
}