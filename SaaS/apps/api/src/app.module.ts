import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'
import { AdminModule } from './admin/admin.module'
import { ArticlesModule } from './articles/articles.module'
import { ClientsModule } from './clients/clients.module'
import { GoalsModule } from './goals/goals.module'
import { MessagesModule } from './messages/messages.module'
import { MoodModule } from './mood/mood.module'
import { PractitionersModule } from './practitioners/practitioners.module'
import { PrescriptionsModule } from './prescriptions/prescriptions.module'
import { PrismaModule } from './prisma/prisma.module'
import { SessionsModule } from './sessions/sessions.module'
import { HealthController } from './health.controller'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../../.env', '.env'],
    }),
    PrismaModule,
    AuthModule,
    ArticlesModule,
    AdminModule,
    ClientsModule,
    PractitionersModule,
    SessionsModule,
    MoodModule,
    GoalsModule,
    MessagesModule,
    PrescriptionsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
