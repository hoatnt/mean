import {Model} from "@mean/shared/src/models/model";
import {RestService} from './rest.service';
import {Body, Delete, Get, HttpStatus, Param, Post, Put, Res} from "@nestjs/common";
import {Response} from "express";

export abstract class RestController<M extends Model> {

    protected constructor(readonly service: RestService<M>) {

    }

    @Get()
    async list(): Promise<M[]> {
        return this.service.list();
    }

    @Get(':id')
    async get(@Param('id') id: string): Promise<M> {
        return this.service.get(id);
    }

    @Post()
    async create(@Body() item: M): Promise<M> {
        return this.service.create(item);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() item: M): Promise<M> {
        return this.service.update(id, item);
    }

    @Delete(':id')
    async delete(@Param('id') id: string, @Res() res: Response) {
        res.status(await this.service.delete(id) ? HttpStatus.NO_CONTENT :  HttpStatus.NOT_FOUND).send();
    }

}