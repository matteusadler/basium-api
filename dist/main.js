"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const platform_fastify_1 = require("@nestjs/platform-fastify");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_fastify_1.FastifyAdapter({
        logger: true,
        bodyLimit: 10485760,
    }));
    app.setGlobalPrefix('api');
    app.enableCors({
        origin: process.env.CORS_ORIGINS?.split(',') || '*',
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    const port = process.env.PORT || 8001;
    await app.listen(port, '0.0.0.0');
    console.log(`🚀 Basium API running on http://localhost:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map