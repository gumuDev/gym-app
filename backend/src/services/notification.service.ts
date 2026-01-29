import { PrismaClient, NotificationType, Channel, NotificationStatus } from '@prisma/client';
import * as telegramService from './telegram.service';

const prisma = new PrismaClient();

/**
 * Templates de mensajes
 */
const messageTemplates = {
  welcome: (memberName: string, memberCode: string, gymName: string) => `
🎉 ¡Bienvenido a ${gymName}!

Hola ${memberName},

Tu cuenta ha sido vinculada exitosamente.
Código: ${memberCode}

Te enviaremos recordatorios antes de que tu membresía venza.

💪 ¡A entrenar!
  `.trim(),

  expiring7Days: (memberName: string, disciplineName: string, endDate: string, gymName: string) => `
⏰ Recordatorio

Hola ${memberName},

Tu membresía de ${disciplineName} vence en <b>7 días</b>.
Fecha de vencimiento: ${endDate}

Acércate a recepción para renovar.

🏋️‍♂️ ${gymName}
  `.trim(),

  expiring3Days: (memberName: string, disciplineName: string, endDate: string, gymName: string) => `
⚠️ Atención

Hola ${memberName},

Tu membresía de ${disciplineName} vence en <b>3 días</b>.
Fecha: ${endDate}

Por favor renueva pronto para seguir entrenando.

📍 ${gymName}
  `.trim(),

  expired: (memberName: string, disciplineName: string, gymName: string) => `
❌ Membresía Vencida

Hola ${memberName},

Tu membresía de ${disciplineName} ha vencido hoy.

Renueva para seguir disfrutando de tus entrenamientos.

📞 Contacta a recepción.

🏢 ${gymName}
  `.trim(),
};

/**
 * Enviar notificación de bienvenida
 */
export const sendWelcomeNotification = async (memberId: string): Promise<void> => {
  try {
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: { gym: true },
    });

    if (!member || !member.telegram_chat_id) {
      console.log(`⚠️ Member ${memberId} no tiene Telegram vinculado`);
      return;
    }

    const message = messageTemplates.welcome(
      member.name,
      member.code,
      member.gym.name
    );

    const success = await telegramService.sendMessage(
      member.gym_id,
      member.telegram_chat_id,
      message
    );

    // Registrar en log
    await prisma.notificationLog.create({
      data: {
        gym_id: member.gym_id,
        member_id: member.id,
        type: 'WELCOME' as NotificationType,
        channel: 'TELEGRAM' as Channel,
        status: success ? ('SENT' as NotificationStatus) : ('FAILED' as NotificationStatus),
        sent_at: new Date(),
        message,
        error: success ? null : 'Error al enviar mensaje',
      },
    });

    console.log(`✅ Notificación de bienvenida enviada a ${member.name}`);
  } catch (error) {
    console.error('Error enviando notificación de bienvenida:', error);
  }
};

/**
 * Enviar notificación de membresía por vencer
 */
export const sendExpiringNotification = async (
  memberId: string,
  membershipId: string,
  daysLeft: number
): Promise<void> => {
  try {
    console.log(`📤 Enviando notificación a member ${memberId} (${daysLeft} días)`);

    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: { gym: true },
    });

    if (!member) {
      console.log(`❌ Member ${memberId} no encontrado`);
      return;
    }

    if (!member.telegram_chat_id) {
      console.log(`⚠️ Member ${member.name} no tiene Telegram vinculado (chat_id: null)`);
      return;
    }

    console.log(`✅ Member encontrado: ${member.name}`);
    console.log(`✅ Telegram chat_id: ${member.telegram_chat_id}`);

    const membership = await prisma.membership.findUnique({
      where: { id: membershipId },
      include: { discipline: true },
    });

    if (!membership) {
      console.log(`⚠️ Membresía ${membershipId} no encontrada`);
      return;
    }

    // Seleccionar template según días restantes
    let message = '';
    const endDate = new Date(membership.end_date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    if (daysLeft === 7) {
      message = messageTemplates.expiring7Days(
        member.name,
        membership.discipline.name,
        endDate,
        member.gym.name
      );
    } else if (daysLeft === 3) {
      message = messageTemplates.expiring3Days(
        member.name,
        membership.discipline.name,
        endDate,
        member.gym.name
      );
    } else if (daysLeft === 0) {
      message = messageTemplates.expired(
        member.name,
        membership.discipline.name,
        member.gym.name
      );
    } else {
      return; // Solo enviamos para 7, 3 y 0 días
    }

    console.log(`🤖 Enviando mensaje vía Telegram...`);
    console.log(`📍 Gym ID: ${member.gym_id}`);
    console.log(`📍 Chat ID: ${member.telegram_chat_id}`);

    const success = await telegramService.sendMessage(
      member.gym_id,
      member.telegram_chat_id,
      message
    );

    if (success) {
      console.log(`✅ Mensaje enviado exitosamente a ${member.name}`);
    } else {
      console.error(`❌ Fallo al enviar mensaje a ${member.name}`);
    }

    // Registrar en log
    await prisma.notificationLog.create({
      data: {
        gym_id: member.gym_id,
        member_id: member.id,
        type: daysLeft === 0 ? ('EXPIRED' as NotificationType) : ('EXPIRING_SOON' as NotificationType),
        channel: 'TELEGRAM' as Channel,
        status: success ? ('SENT' as NotificationStatus) : ('FAILED' as NotificationStatus),
        sent_at: new Date(),
        message,
        error: success ? null : 'Error al enviar mensaje',
      },
    });

    console.log(`📝 Notificación registrada en base de datos (status: ${success ? 'SENT' : 'FAILED'})`);
  } catch (error: any) {
    console.error(`❌ Error enviando notificación de vencimiento a member ${memberId}:`, error.message);
  }
};

/**
 * Verificar y enviar notificaciones de membresías por vencer
 */
export const checkExpiringMemberships = async (isTest: boolean): Promise<void> => {
  try {
    console.log('🔍 Verificando membresías por vencer...');

    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    // Buscar TODAS las membresías activas que vencen en los próximos 8 días
    const maxDays = new Date(today);
    maxDays.setDate(today.getDate() + 8);

    const expiringMemberships = await prisma.membership.findMany({
      where: {
        status: 'ACTIVE',
        end_date: {
          gte: today,
          lte: maxDays,
        },
      },
      include: {
        member: true,
        discipline: true,
      },
    });

    if (expiringMemberships.length === 0) {
      // Debug: Mostrar TODAS las membresías activas para debugging
      const allActive = await prisma.membership.findMany({
        where: { status: 'ACTIVE' },
        select: {
          id: true,
          end_date: true,
          member: { select: { name: true } },
          discipline: { select: { name: true } },
        },
        take: 10,
      });

      allActive.forEach((m) => {
        const endDate = new Date(m.end_date);
        endDate.setHours(0, 0, 0, 0);
        const diffTime = endDate.getTime() - today.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        console.log(`   - ${m.member?.name || 'N/A'} (${m.discipline.name}): vence ${endDate.toLocaleDateString('es-ES')} (en ${diffDays} días)`);
      });

      return;
    }

    // Procesar cada membresía y calcular días exactos restantes
    for (const membership of expiringMemberships) {
      // Saltar membresías grupales sin member directo (deberían tener membershipMembers)
      if (!membership.member) {
        console.log(`⏭️ Membresía ${membership.id} es grupal, omitiendo...`);
        continue;
      }

      console.log(`\n--- Procesando membresía ${membership.id} ---`);
      console.log(`👤 Member: ${membership.member.name}`);
      console.log(`🏋️  Disciplina: ${membership.discipline.name}`);

      const membershipEndDate = new Date(membership.end_date);
      console.log(`📅 Vence: ${membershipEndDate.toLocaleDateString('es-ES')} ${membershipEndDate.toLocaleTimeString('es-ES')}`);

      // Calcular días restantes (normalizar a medianoche para comparación precisa)
      const endDate = new Date(membership.end_date);
      endDate.setHours(0, 0, 0, 0);

      const diffTime = endDate.getTime() - today.getTime();
      const diffDaysExact = diffTime / (1000 * 60 * 60 * 24);
      const diffDays = Math.round(diffDaysExact);

      console.log(`⏰ Días restantes: ${diffDaysExact.toFixed(2)} días (redondeado: ${diffDays})`);

      // Determinar tipo de notificación basado en rangos flexibles
      let notificationDays: number | null = null;

      if (diffDays >= 0 && diffDays <= 0) {
        // Vence HOY (0 días)
        notificationDays = 0;
        console.log(`✅ Categorizado como: VENCE HOY (0 días)`);
      } else if (diffDays >= 2 && diffDays <= 4) {
        // Vence en ~3 días (rango: 2-4 días)
        notificationDays = 3;
        console.log(`✅ Categorizado como: VENCE EN 3 DÍAS (rango 2-4)`);
      } else if (diffDays >= 6 && diffDays <= 8) {
        // Vence en ~7 días (rango: 6-8 días)
        notificationDays = 7;
        console.log(`✅ Categorizado como: VENCE EN 7 DÍAS (rango 6-8)`);
      } else {
        console.log(`⏭️ Días restantes (${diffDays}) fuera de rangos configurados (0, 2-4, 6-8). Omitiendo.`);
        continue;
      }

      // Verificar si ya se envió notificación EXITOSA hoy para este member y tipo
      const notificationType = notificationDays === 0 ? 'EXPIRED' : 'EXPIRING_SOON';
      const alreadySent = await prisma.notificationLog.findFirst({
        where: {
          member_id: membership.member.id,
          type: notificationType,
          status: 'SENT',
          sent_at: {
            gte: today,
          },
        },
      });
      console.log(`isTest: ${isTest}`);
      if (alreadySent && !isTest) {
        console.log(`⏭️ Ya se envió notificación exitosa hoy a ${membership.member.name} (ID: ${alreadySent.id})`);
        console.log(`   Enviada a las: ${alreadySent.sent_at.toLocaleTimeString('es-ES')}`);
        continue;
      }

      // Enviar notificación
      console.log(`🚀 Procediendo a enviar notificación de ${notificationDays} días...`);
      await sendExpiringNotification(
        membership.member.id,
        membership.id,
        notificationDays
      );
    }

    console.log('✅ Verificación de membresías completada');
  } catch (error) {
    console.error('Error verificando membresías:', error);
  }
};

/**
 * Obtener historial de notificaciones de un gym con paginación
 */
export const getNotificationsByGym = async (
  gymId: string,
  filters?: {
    type?: NotificationType;
    status?: NotificationStatus;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }
) => {
  try {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = { gym_id: gymId };

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.startDate || filters?.endDate) {
      where.sent_at = {};

      if (filters.startDate) {
        where.sent_at.gte = filters.startDate;
      }

      if (filters.endDate) {
        where.sent_at.lte = filters.endDate;
      }
    }

    // Obtener total de registros (para calcular totalPages)
    const total = await prisma.notificationLog.count({ where });

    // Obtener notificaciones paginadas
    const notifications = await prisma.notificationLog.findMany({
      where,
      include: {
        member: {
          select: {
            name: true,
            code: true,
          },
        },
      },
      orderBy: { sent_at: 'desc' },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    return {
      data: notifications,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasMore,
        hasPrevious: page > 1,
      },
    };
  } catch (error) {
    console.error('Error obteniendo notificaciones:', error);
    throw error;
  }
};
