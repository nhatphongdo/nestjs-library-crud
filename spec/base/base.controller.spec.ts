import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BaseController } from './base.controller';
import { BaseEntity } from './base.entity';
import { BaseModule } from './base.module';
import { BaseService } from './base.service';

describe('BaseController', () => {
    let app: INestApplication;
    let controller: BaseController;
    let service: BaseService;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                BaseModule,
                TypeOrmModule.forRoot({
                    type: 'sqlite',
                    database: ':memory:',
                    entities: [BaseEntity],
                    synchronize: true,
                    logging: true,
                    logger: 'file',
                }),
            ],
        }).compile();
        app = moduleFixture.createNestApplication();

        controller = moduleFixture.get<BaseController>(BaseController);
        service = moduleFixture.get<BaseService>(BaseService);
        await Promise.all(['name1', 'name2'].map((name: string) => service.repository.save(service.repository.create({ name }))));

        await app.init();
    });

    afterAll(async () => {
        if (app) {
            await app.close();
        }
    });

    it('dynamic method on controller', async () => {
        const controllerPrototype = Object.getPrototypeOf(controller);
        const propertyNames = Object.getOwnPropertyNames(controllerPrototype).filter((name) => name !== 'constructor');

        const expectedMethods = [
            'reservedReadOne',
            'reservedReadMany',
            'reservedCreate',
            'reservedUpdate',
            'reservedUpsert',
            'reservedDelete',
            'reservedRecover',
            'reservedSearch',
        ];

        expect(propertyNames).toHaveLength(expectedMethods.length);
        expect(propertyNames).toEqual(expect.arrayContaining(expectedMethods));
    });
});
