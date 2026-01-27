import cron from 'node-cron';
import * as notificationService from '../services/notification.service';

/**
 * Cron job para verificar y enviar notificaciones de membresías por vencer
 * Se ejecuta todos los días a las 8:00 AM
 */
export const initNotificationsJob = () => {
  // Cron expression: "0 8 * * *" = Cada día a las 8:00 AM
  // Formato: segundo minuto hora día mes día-semana
  const schedule = process.env.CRON_NOTIFICATIONS_SCHEDULE || '0 8 * * *';

  cron.schedule(schedule, async () => {
    const now = new Date().toLocaleString('es-ES', {
      timeZone: 'America/La_Paz',
      dateStyle: 'short',
      timeStyle: 'short',
    });

    console.log(`\n⏰ [${now}] Ejecutando cron job de notificaciones...`);

    try {
      await notificationService.checkExpiringMemberships(false);
      console.log(`✅ [${now}] Cron job completado exitosamente\n`);
    } catch (error) {
      console.error(`❌ [${now}] Error en cron job:`, error);
    }
  });

  console.log(`⏰ Cron job de notificaciones configurado (${schedule})`);
  console.log(`   Se ejecutará todos los días a las 8:00 AM`);
};

/**
 * Ejecutar manualmente el job (para testing)
 */
export const runNotificationsJobNow = async (): Promise<void> => {
  console.log('\n🔧 Ejecutando job de notificaciones manualmente...');

  try {
    await notificationService.checkExpiringMemberships(false);
    console.log('✅ Job manual completado\n');
  } catch (error) {
    console.error('❌ Error en job manual:', error);
  }
};
