import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import { PermisosGuard } from './common/guards/permisos.guard';
import { CatalogoModule } from './modules/catalogo/catalogo.module';
import { AuthModule } from './modules/auth/auth.module';
import { PersonaModule } from './modules/persona/persona.module';
import { SolicitudModule } from './modules/solicitud/solicitud.module';
import { EventoModule } from './modules/evento/evento.module';
import { AgendamientoModule } from './modules/agendamiento/agendamiento.module';
import { DispositivoModule } from './modules/dispositivo/dispositivo.module';
import { ArchivoModule } from './modules/archivo/archivo.module';
import { NotificacionModule } from './modules/notificacion/notificacion.module';
import { PjudModule } from './modules/pjud/pjud.module';
import { PrefacturacionModule } from './modules/prefacturacion/prefacturacion.module';
import { CargaLaboralModule } from './modules/carga-laboral/carga-laboral.module';
import { NormalizeSubscriber } from './common/subscribers/normalize.subscriber';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mssql',
        host: config.get('database.host'),
        port: config.get('database.port'),
        username: config.get('database.username'),
        password: config.get('database.password'),
        database: config.get('database.database'),
        options: {
          encrypt: false,
          trustServerCertificate: true,
        },
        subscribers: [NormalizeSubscriber],
        autoLoadEntities: true,
        synchronize: false,
        logging:
          config.get('NODE_ENV') === 'development'
            ? ['error', 'warn']
            : ['error'],
      }),
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/public',
      serveStaticOptions: { index: false },
    }),
    CatalogoModule,
    AuthModule,
    PersonaModule,
    SolicitudModule,
    EventoModule,
    AgendamientoModule,
    DispositivoModule,
    ArchivoModule,
    NotificacionModule,
    PjudModule,
    PrefacturacionModule,
    CargaLaboralModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermisosGuard,
    },
  ],
})
export class AppModule {}
