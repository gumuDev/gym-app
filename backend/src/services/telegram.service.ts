import { Telegraf, Context } from 'telegraf';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface BotInstance {
  bot: Telegraf;
  gymId: string;
}

// Store bot instances per gym
const botInstances = new Map<string, BotInstance>();

/**
 * Inicializar bot de Telegram para un gym
 */
export const initBot = async (gymId: string, botToken: string): Promise<void> => {
  try {
    console.log(`🤖 Iniciando bot para gym: ${gymId}`);

    // Si ya existe un bot para este gym, detenerlo
    if (botInstances.has(gymId)) {
      console.log(`⚠️  Ya existe un bot para gym ${gymId}, deteniéndolo...`);
      const existingBot = botInstances.get(gymId);
      await existingBot?.bot.stop();
      botInstances.delete(gymId);
    }

    const bot = new Telegraf(botToken);

    // Verificar que el token sea válido y guardar username
    try {
      const botInfo = await bot.telegram.getMe();
      console.log(`✅ Token válido para bot: @${botInfo.username}`);

      // Guardar el username del bot en la BD
      await prisma.gym.update({
        where: { id: gymId },
        data: { telegram_bot_username: botInfo.username },
      });
      console.log(`✅ Username del bot guardado: @${botInfo.username}`);
    } catch (error: any) {
      console.error(`❌ Token inválido:`, error.message);
      throw new Error(`Token inválido o error de conexión: ${error.message}`);
    }

    console.log(`📝 Registrando comandos del bot...`);

    // Comando /start - Vincular member por código o teléfono
    bot.command('start', async (ctx: Context) => {
      const args = ctx.message && 'text' in ctx.message ? ctx.message.text.split(' ') : [];
      const identifier = args[1]; // /start GYM-XXXXXX-001 o /start 1234567890

      if (!identifier) {
        await ctx.reply(
          '❌ Por favor proporciona tu código o teléfono.\n\n' +
          'Ejemplos:\n' +
          '/start GYM-XXXXXX-001\n' +
          '/start 1234567890\n\n' +
          'Puedes encontrar tu información en la app o pregunta en recepción.'
        );
        return;
      }

      try {
        // Detectar si es código (empieza con GYM-) o teléfono
        const isCode = identifier.toUpperCase().startsWith('GYM-');

        let member;

        if (isCode) {
          // Buscar por código
          member = await prisma.member.findUnique({
            where: { code: identifier.toUpperCase() },
            include: { gym: true },
          });
        } else {
          // Buscar por teléfono
          member = await prisma.member.findFirst({
            where: {
              phone: identifier,
              gym_id: gymId
            },
            include: { gym: true },
          });
        }

        if (!member) {
          await ctx.reply(
            `❌ ${isCode ? 'Código' : 'Teléfono'} no encontrado.\n\n` +
            'Verifica tu información e intenta nuevamente.'
          );
          return;
        }

        if (member.gym_id !== gymId) {
          await ctx.reply('❌ Esta información no pertenece a este gimnasio.');
          return;
        }

        if (!member.is_active) {
          await ctx.reply('❌ Tu cuenta está inactiva. Contacta a recepción.');
          return;
        }

        // Guardar chat_id del member
        const chatId = ctx.chat?.id.toString();
        await prisma.member.update({
          where: { id: member.id },
          data: { telegram_chat_id: chatId },
        });

        await ctx.reply(
          `✅ Cuenta vinculada exitosamente!\n\n` +
          `Hola ${member.name}!\n` +
          `Código: ${member.code}\n\n` +
          `Recibirás notificaciones sobre tu membresía.\n\n` +
          `Comandos disponibles:\n` +
          `/info - Ver estado de tu membresía\n` +
          `/desvincular - Dejar de recibir notificaciones`
        );

        console.log(`✅ Member ${member.name} vinculado a Telegram (chat_id: ${chatId})`);
      } catch (error) {
        console.error('Error vinculando member:', error);
        await ctx.reply('❌ Error al vincular cuenta. Intenta más tarde.');
      }
    });

    // Comando /info - Ver estado de membresía
    bot.command('info', async (ctx: Context) => {
      try {
        const chatId = ctx.chat?.id.toString();

        // Buscar member por chat_id
        const member = await prisma.member.findFirst({
          where: {
            telegram_chat_id: chatId,
            gym_id: gymId,
          },
          include: {
            memberships: {
              where: { status: 'ACTIVE' },
              include: { discipline: true },
              orderBy: { end_date: 'desc' },
              take: 1,
            },
          },
        });

        if (!member) {
          await ctx.reply(
            '❌ No estás vinculado.\n\n' +
            'Usa /start [tu-código] para vincular tu cuenta.'
          );
          return;
        }

        const activeMembership = member.memberships[0];

        if (!activeMembership) {
          await ctx.reply(
            `📊 Tu Información\n\n` +
            `Nombre: ${member.name}\n` +
            `Código: ${member.code}\n\n` +
            `❌ Sin membresía activa\n\n` +
            `Acércate a recepción para adquirir una membresía.`
          );
          return;
        }

        const endDate = new Date(activeMembership.end_date);
        const today = new Date();
        const diffTime = endDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const statusEmoji = diffDays > 7 ? '✅' : diffDays > 0 ? '⚠️' : '❌';
        const statusText = diffDays > 0 ? 'Activa' : 'Vencida';

        await ctx.reply(
          `📊 Tu Membresía\n\n` +
          `Disciplina: ${activeMembership.discipline.name}\n` +
          `Estado: ${statusText} ${statusEmoji}\n` +
          `Vence: ${endDate.toLocaleDateString('es-ES')}\n` +
          `${diffDays > 0 ? `(${diffDays} días restantes)` : ''}\n\n` +
          `${diffDays <= 7 && diffDays > 0 ? '⚠️ Tu membresía está por vencer. Renueva pronto!\n\n' : ''}` +
          `💪 ${diffDays > 0 ? '¡Sigue entrenando!' : 'Renueva para seguir entrenando!'}`
        );
      } catch (error) {
        console.error('Error obteniendo info:', error);
        await ctx.reply('❌ Error al obtener información. Intenta más tarde.');
      }
    });

    // Comando /desvincular - Desvincular cuenta
    bot.command('desvincular', async (ctx: Context) => {
      try {
        const chatId = ctx.chat?.id.toString();

        const member = await prisma.member.findFirst({
          where: {
            telegram_chat_id: chatId,
            gym_id: gymId,
          },
        });

        if (!member) {
          await ctx.reply('❌ No estás vinculado.');
          return;
        }

        await prisma.member.update({
          where: { id: member.id },
          data: { telegram_chat_id: null },
        });

        await ctx.reply(
          `✅ Cuenta desvinculada exitosamente.\n\n` +
          `Ya no recibirás notificaciones.\n\n` +
          `Puedes volver a vincularte con:\n` +
          `/start ${member.code}\n` +
          `o /start ${member.phone}`
        );

        console.log(`✅ Member ${member.name} desvinculado de Telegram`);
      } catch (error) {
        console.error('Error desvinculando member:', error);
        await ctx.reply('❌ Error al desvincular. Intenta más tarde.');
      }
    });

    // Manejar comandos desconocidos
    bot.on('text', async (ctx: Context) => {
      const text = ctx.message && 'text' in ctx.message ? ctx.message.text : '';

      if (!text.startsWith('/')) {
        await ctx.reply(
          '❓ Comandos disponibles:\n\n' +
          '/start [código o teléfono] - Vincular cuenta\n' +
          'Ejemplo: /start GYM-XXXXXX-001\n' +
          'o /start 1234567890\n\n' +
          '/info - Ver estado de membresía\n' +
          '/desvincular - Dejar de recibir notificaciones'
        );
      }
    });

    console.log(`💾 Guardando instancia del bot en memoria...`);

    // Store instance BEFORE launching (para que esté disponible inmediatamente para enviar mensajes)
    botInstances.set(gymId, { bot, gymId });
    console.log(`✅ Bot guardado en memoria (total activos: ${botInstances.size})`);

    // Launch bot (para escuchar comandos)
    console.log(`🚀 Lanzando bot (modo polling)...`);
    try {
      await bot.launch();
      console.log(`✅ Bot en modo polling - escuchando comandos`);
    } catch (launchError: any) {
      console.error(`⚠️  Error al lanzar bot (polling):`, launchError.message);
      console.log(`💡 Bot guardado de todas formas - podrá enviar mensajes`);
    }

    console.log(`✅ Telegram bot inicializado para gym: ${gymId}`);
  } catch (error: any) {
    console.error('Error iniciando bot:', error);
    throw new Error(`Error al iniciar bot de Telegram: ${error.message}`);
  }
};

/**
 * Enviar mensaje a un chat específico
 */
export const sendMessage = async (
  gymId: string,
  chatId: string,
  message: string
): Promise<boolean> => {
  try {
    console.log(`📨 Intentando enviar mensaje...`);
    console.log(`   Gym ID: ${gymId}`);
    console.log(`   Chat ID: ${chatId}`);
    console.log(`   Total bots activos: ${botInstances.size}`);
    console.log(`   Gym IDs en memoria: [${Array.from(botInstances.keys()).join(', ') || 'ninguno'}]`);

    const botInstance = botInstances.get(gymId);

    if (!botInstance) {
      console.error(`❌ Bot no inicializado para gym: ${gymId}`);
      console.error(`💡 Bots disponibles:`);
      for (const [key, value] of botInstances.entries()) {
        console.error(`   - ${key} (${value.gymId})`);
      }
      throw new Error('Bot no inicializado para este gym. Verifica que el token esté configurado correctamente en Settings → Telegram Bot.');
    }

    console.log(`✅ Bot encontrado para gym ${gymId}`);

    await botInstance.bot.telegram.sendMessage(chatId, message, {
      parse_mode: 'HTML',
    });

    console.log(`✅ Mensaje enviado exitosamente a chat ${chatId}`);
    return true;
  } catch (error: any) {
    console.error(`❌ Error enviando mensaje a chat ${chatId}:`, error.message);

    // Mostrar detalles adicionales del error si están disponibles
    if (error.response) {
      console.error(`   Código de error: ${error.response.error_code}`);
      console.error(`   Descripción: ${error.response.description}`);
    }

    return false;
  }
};

/**
 * Detener bot de un gym
 */
export const stopBot = async (gymId: string): Promise<void> => {
  const botInstance = botInstances.get(gymId);

  if (botInstance) {
    await botInstance.bot.stop();
    botInstances.delete(gymId);
    console.log(`✅ Bot detenido para gym: ${gymId}`);
  }
};

/**
 * Verificar si un bot está activo
 */
export const isBotActive = (gymId: string): boolean => {
  return botInstances.has(gymId);
};

/**
 * Inicializar todos los bots de gyms activos al arrancar el servidor
 */
export const initAllBots = async (): Promise<void> => {
  try {
    const gyms = await prisma.gym.findMany({
      where: {
        is_active: true,
        telegram_bot_token: { not: null },
      },
    });

    console.log(`\n🤖 Inicializando ${gyms.length} bots de Telegram...`);

    if (gyms.length === 0) {
      console.log('⚠️  No hay gyms con Telegram configurado');
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const gym of gyms) {
      if (gym.telegram_bot_token) {
        try {
          console.log(`\n--- Inicializando bot para: ${gym.name} ---`);
          await initBot(gym.id, gym.telegram_bot_token);
          successCount++;
          console.log(`✅ Bot completamente iniciado para: ${gym.name}\n`);
        } catch (error: any) {
          failCount++;
          console.error(`❌ Error crítico iniciando bot para ${gym.name}:`, error.message);
          console.error(`   Stack:`, error.stack);
        }
      }
    }

    console.log(`\n📊 Resumen de inicialización:`);
    console.log(`   ✅ Exitosos: ${successCount}`);
    console.log(`   ❌ Fallidos: ${failCount}`);
    console.log(`   💡 Bots activos en memoria: ${botInstances.size}`);
    console.log(`   🔑 Gym IDs: [${Array.from(botInstances.keys()).join(', ') || 'ninguno'}]\n`);
  } catch (error) {
    console.error('❌ Error general inicializando bots:', error);
  }
};

// Graceful shutdown
process.once('SIGINT', async () => {
  console.log('Deteniendo bots de Telegram...');
  for (const [gymId] of botInstances) {
    await stopBot(gymId);
  }
  process.exit(0);
});

process.once('SIGTERM', async () => {
  console.log('Deteniendo bots de Telegram...');
  for (const [gymId] of botInstances) {
    await stopBot(gymId);
  }
  process.exit(0);
});
