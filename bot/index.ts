import { Telegraf } from 'telegraf';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import crypto from 'crypto';

const prisma = new PrismaClient();
const botToken = process.env.BOT_TOKEN;
const WEB_URL = process.env.WEB_URL || 'https://ping.univora.website';

if (!botToken) {
  console.error("❌ BOT_TOKEN is not defined.");
  process.exit(1);
}

const bot = new Telegraf(botToken);

function generateToken(length = 64): string {
  return crypto.randomBytes(length).toString('hex').slice(0, length);
}

const FSUB_CHANNEL_ID = '-1002657096509';
const FSUB_CHANNEL_LINK = 'https://t.me/Univora88';
const GROUP_LINK = 'https://t.me/UNIVORA_CHAT';

// Force Join Middleware
bot.use(async (ctx, next) => {
  if (ctx.chat?.type === 'private') {
    try {
      const member = await ctx.telegram.getChatMember(FSUB_CHANNEL_ID, ctx.from!.id);
      if (['left', 'kicked', 'restricted'].includes(member.status)) {
        if (ctx.callbackQuery && (ctx.callbackQuery as any).data === 'refresh_fsub') {
          return ctx.answerCbQuery("❌ You haven't joined the channel yet!", { show_alert: true });
        }
        const msg = `👋 <b>Hello <a href="tg://user?id=${ctx.from!.id}">${ctx.from!.first_name}</a>!</b>\n\nTo use this bot, you must join our official channel. Please join and click "Refresh".`;
        return ctx.reply(msg, {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: '📢 Join Channel', url: FSUB_CHANNEL_LINK }],
              [{ text: '🔄 Refresh', callback_data: 'refresh_fsub' }]
            ]
          },
          link_preview_options: { is_disabled: true },
        });
      } else {
        if (ctx.callbackQuery && (ctx.callbackQuery as any).data === 'refresh_fsub') {
          await ctx.deleteMessage().catch(() => {});
          await ctx.reply('✅ <b>Thank you for joining!</b> Send /start to begin.', { parse_mode: 'HTML' });
          return;
        }
      }
    } catch (e) {
      console.log('Fsub check error:', e);
    }
  }
  return next();
});

const startMessage = (ctx: any) => {
  const telegramId = ctx.from?.id.toString();
  const name = ctx.from?.first_name || 'User';
  const botUsername = ctx.botInfo?.username || 'PingBot';

  return `
✦ 𝗪𝗲𝗹𝗰𝗼𝗺𝗲 𝘁𝗼 <a href="tg://resolve?domain=${botUsername}">𝗣𝗶𝗻𝗴𝗕𝗼𝘁</a>, <a href="tg://user?id=${telegramId}">${name}</a>! ✦

<blockquote>🤖 <b>Your Ultimate Uptime Guardian</b>
I am here to keep an eye on your websites, APIs, and servers. If anything goes offline, I will notify you instantly!

📈 <b>Key Features:</b>
• 24/7 Uptime Monitoring
• Real-time Latency Tracking
• Detailed Web Analytics
• Instant Outage Alerts</blockquote>

<i>Tap the buttons below to explore what I can do!</i>
`;
};

const startMarkup = {
  inline_keyboard: [
    [{ text: '📖 Help & Commands', callback_data: 'help_menu' }],
    [{ text: '📢 Channel', url: FSUB_CHANNEL_LINK }, { text: '💬 Group', url: GROUP_LINK }],
    [{ text: 'ℹ️ About', callback_data: 'about_menu' }, { text: '👨‍💻 Developer', url: 'https://t.me/aaghazafzal' }]
  ]
};

// ───────────────── /start ─────────────────
bot.command('start', async (ctx) => {
  const telegramId = ctx.from?.id.toString();
  const name = ctx.from?.first_name || 'User';
  const username = ctx.from?.username || null;
  if (!telegramId) return;

  await ctx.reply(startMessage(ctx), { 
    parse_mode: 'HTML',
    reply_markup: startMarkup,
    link_preview_options: { is_disabled: true } 
  });

  // 2. Ensure user is in DB instantly
  await prisma.user.upsert({
    where: { telegramId },
    update: { name, username },
    create: { telegramId, name, username, photoUrl: null },
  });

  // 3. Fetch Profile Photo in Background
  (async () => {
    try {
      const photos = await ctx.telegram.getUserProfilePhotos(ctx.from!.id, 0, 1);
      if (photos.total_count > 0) {
        const fileId = photos.photos[0][0].file_id;
        const file = await ctx.telegram.getFile(fileId);
        const url = `https://api.telegram.org/file/bot${botToken}/${file.file_path}`;
        
        const fs = require('fs');
        const path = require('path');
        const avatarPath = path.join(process.cwd(), 'public', 'avatars', `${telegramId}.jpg`);
        
        const axiosResponse = await axios({ url, responseType: 'stream' });
        await new Promise((resolve, reject) => {
          axiosResponse.data.pipe(fs.createWriteStream(avatarPath))
            .on('finish', resolve)
            .on('error', reject);
        });
        
        await prisma.user.update({
          where: { telegramId },
          data: { photoUrl: `/avatars/${telegramId}.jpg` }
        });
      }
    } catch (e) {
      console.log('Background photo fetch error:', e);
    }
  })();
});

// ───────────────── Button Menus ─────────────────
bot.action('start_menu', async (ctx) => {
  await ctx.editMessageText(startMessage(ctx), {
    parse_mode: 'HTML',
    reply_markup: startMarkup,
    link_preview_options: { is_disabled: true }
  }).catch(() => {});
});

bot.action('help_menu', async (ctx) => {
  const msg = `
📖 <b>𝗣𝗶𝗻𝗴𝗕𝗼𝘁 — Command Reference</b>

<b>🔹 Monitor Management</b>
  /add <code>&lt;url&gt; &lt;interval&gt;</code>
  /remove <code>&lt;url&gt;</code>
  /pause <code>&lt;url&gt;</code>
  /resume <code>&lt;url&gt;</code>
  /list

<b>🔹 Analytics & Account</b>
  /stats
  /login

<blockquote>🌐 The web dashboard provides detailed charts, API key management, and full analytics history.</blockquote>
`;
  await ctx.editMessageText(msg, {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [[{ text: '⬅️ Back', callback_data: 'start_menu' }]]
    },
    link_preview_options: { is_disabled: true }
  }).catch(() => {});
});

bot.action('about_menu', async (ctx) => {
  const msg = `
ℹ️ <b>𝗔𝗯𝗼𝘂𝘁 𝗣𝗶𝗻𝗴𝗕𝗼𝘁</b>

PingBot is an advanced server and website monitoring tool designed for Telegram. Built with Next.js, Prisma, and Telegraf, it ensures your digital assets are always online.

<b>Version:</b> 1.0.0
<b>Developer:</b> <a href="https://t.me/aaghazafzal">AAGHAZ</a>
`;
  await ctx.editMessageText(msg, {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [[{ text: '⬅️ Back', callback_data: 'start_menu' }]]
    },
    link_preview_options: { is_disabled: true }
  }).catch(() => {});
});

// ───────────────── /help ─────────────────
bot.command('help', async (ctx) => {
  const msg = `
📖 <b>𝗣𝗶𝗻𝗴𝗕𝗼𝘁 — Command Reference</b>

<b>🔹 Monitor Management</b>
  /add <code>&lt;url&gt; &lt;interval&gt;</code>
  <i>Add a new URL to monitor. Interval is in minutes.</i>
  <i>Example:</i> <code>/add https://google.com 5</code>

  /remove <code>&lt;url&gt;</code>
  <i>Remove a URL from your monitors.</i>

  /pause <code>&lt;url&gt;</code>
  <i>Temporarily pause monitoring a URL.</i>

  /resume <code>&lt;url&gt;</code>
  <i>Resume a paused monitor.</i>

  /list
  <i>View all your active monitors with status.</i>

<b>🔹 Analytics & Account</b>
  /stats
  <i>Quick overview: total pings, avg latency, uptime %.</i>

  /login
  <i>Get a secure login link for the web dashboard.</i>

<blockquote>🌐 The web dashboard provides detailed charts, API key management, and full analytics history.</blockquote>
`;
  ctx.reply(msg, { parse_mode: 'HTML', link_preview_options: { is_disabled: true } });
});

// ───────────────── /add ─────────────────
bot.command('add', async (ctx) => {
  const telegramId = ctx.from?.id.toString();
  if (!telegramId) return;

  const args = ctx.message.text.split(' ').slice(1);
  if (args.length !== 2) {
    return ctx.reply(
      `⚠️ <b>Invalid format</b>\n\n<b>Usage:</b> <code>/add &lt;url&gt; &lt;interval_in_minutes&gt;</code>\n\n<i>Example:</i> <code>/add https://example.com 5</code>`,
      { parse_mode: 'HTML' }
    );
  }

  let [url, intervalStr] = args;
  const interval = parseInt(intervalStr, 10);

  if (isNaN(interval) || interval < 1) {
    return ctx.reply('⚠️ Interval must be a number ≥ 1 minute.', { parse_mode: 'HTML' });
  }

  // Auto-add https if missing
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  try {
    const user = await prisma.user.findUnique({ where: { telegramId } });
    if (!user) return ctx.reply('⚠️ Send /start first to register.', { parse_mode: 'HTML' });

    // Check for duplicate
    const exists = await prisma.pingJob.findFirst({
      where: { userId: user.id, url }
    });
    if (exists) {
      return ctx.reply(`⚠️ You're already monitoring <code>${url}</code>`, { parse_mode: 'HTML' });
    }

    await prisma.pingJob.create({
      data: { url, interval, userId: user.id },
    });

    ctx.reply(
      `✅ <b>Monitor Added Successfully</b>\n\n<blockquote>🌐 URL: ${url}\n⏱ Interval: Every ${interval} minute${interval > 1 ? 's' : ''}</blockquote>\n\n<i>🔄 Pinging will start within 60 seconds.</i>`,
      { parse_mode: 'HTML' }
    );
  } catch (error) {
    console.error(error);
    ctx.reply('❌ Something went wrong. Please try again.', { parse_mode: 'HTML' });
  }
});

// ───────────────── /remove ─────────────────
bot.command('remove', async (ctx) => {
  const telegramId = ctx.from?.id.toString();
  if (!telegramId) return;

  const url = ctx.message.text.split(' ').slice(1).join(' ');
  if (!url) {
    return ctx.reply('⚠️ <b>Usage:</b> <code>/remove &lt;url&gt;</code>', { parse_mode: 'HTML' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { telegramId } });
    if (!user) return ctx.reply('⚠️ Send /start first.', { parse_mode: 'HTML' });

    const job = await prisma.pingJob.findFirst({ where: { userId: user.id, url } });
    if (!job) return ctx.reply(`⚠️ No monitor found for <code>${url}</code>`, { parse_mode: 'HTML' });

    // Delete logs first, then job
    await prisma.pingLog.deleteMany({ where: { jobId: job.id } });
    await prisma.pingJob.delete({ where: { id: job.id } });

    ctx.reply(`🗑 <b>Monitor Removed</b>\n\n<i>${url} is no longer being monitored.</i>`, { parse_mode: 'HTML' });
  } catch (error) {
    console.error(error);
    ctx.reply('❌ Failed to remove monitor.', { parse_mode: 'HTML' });
  }
});

// ───────────────── /pause ─────────────────
bot.command('pause', async (ctx) => {
  const telegramId = ctx.from?.id.toString();
  if (!telegramId) return;
  const url = ctx.message.text.split(' ').slice(1).join(' ');
  if (!url) return ctx.reply('⚠️ <b>Usage:</b> <code>/pause &lt;url&gt;</code>', { parse_mode: 'HTML' });

  try {
    const user = await prisma.user.findUnique({ where: { telegramId } });
    if (!user) return ctx.reply('⚠️ Send /start first.', { parse_mode: 'HTML' });
    const job = await prisma.pingJob.findFirst({ where: { userId: user.id, url } });
    if (!job) return ctx.reply(`⚠️ No monitor found for <code>${url}</code>`, { parse_mode: 'HTML' });

    await prisma.pingJob.update({ where: { id: job.id }, data: { isActive: false } });
    ctx.reply(`⏸ <b>Monitor Paused</b>\n\n<i>${url} monitoring is paused. Use /resume to continue.</i>`, { parse_mode: 'HTML' });
  } catch (error) {
    console.error(error);
    ctx.reply('❌ Failed to pause.', { parse_mode: 'HTML' });
  }
});

// ───────────────── /resume ─────────────────
bot.command('resume', async (ctx) => {
  const telegramId = ctx.from?.id.toString();
  if (!telegramId) return;
  const url = ctx.message.text.split(' ').slice(1).join(' ');
  if (!url) return ctx.reply('⚠️ <b>Usage:</b> <code>/resume &lt;url&gt;</code>', { parse_mode: 'HTML' });

  try {
    const user = await prisma.user.findUnique({ where: { telegramId } });
    if (!user) return ctx.reply('⚠️ Send /start first.', { parse_mode: 'HTML' });
    const job = await prisma.pingJob.findFirst({ where: { userId: user.id, url } });
    if (!job) return ctx.reply(`⚠️ No monitor found for <code>${url}</code>`, { parse_mode: 'HTML' });

    await prisma.pingJob.update({ where: { id: job.id }, data: { isActive: true } });
    ctx.reply(`▶️ <b>Monitor Resumed</b>\n\n<i>${url} is now active again.</i>`, { parse_mode: 'HTML' });
  } catch (error) {
    console.error(error);
    ctx.reply('❌ Failed to resume.', { parse_mode: 'HTML' });
  }
});

// ───────────────── /list ─────────────────
bot.command('list', async (ctx) => {
  const telegramId = ctx.from?.id.toString();
  if (!telegramId) return;

  try {
    const user = await prisma.user.findUnique({
      where: { telegramId },
      include: { jobs: { include: { logs: { take: 1, orderBy: { timestamp: 'desc' } } } } },
    });

    if (!user || user.jobs.length === 0) {
      return ctx.reply(
        '📭 <b>No Monitors Found</b>\n\n<i>Use /add to start monitoring a URL.</i>',
        { parse_mode: 'HTML' }
      );
    }

    let msg = `📋 <b>Your Monitors (${user.jobs.length})</b>\n\n`;
    user.jobs.forEach((job, i) => {
      const status = job.isActive ? '🟢 Active' : '🔴 Paused';
      const lastLatency = job.logs[0]?.latency ? `${job.logs[0].latency}ms` : '—';
      const lastStatus = job.logs[0]?.success ? '✅' : job.logs[0] ? '❌' : '—';
      msg += `<b>${i + 1}. ${job.url}</b>\n`;
      msg += `   ├ Status: ${status}\n`;
      msg += `   ├ Interval: ${job.interval}m\n`;
      msg += `   ├ Last Ping: ${lastStatus} ${lastLatency}\n`;
      msg += `   └ Created: ${new Date(job.createdAt).toLocaleDateString()}\n\n`;
    });

    ctx.reply(msg, { parse_mode: 'HTML' });
  } catch (error) {
    console.error(error);
    ctx.reply('❌ Failed to fetch monitors.', { parse_mode: 'HTML' });
  }
});

// ───────────────── /stats ─────────────────
bot.command('stats', async (ctx) => {
  const telegramId = ctx.from?.id.toString();
  if (!telegramId) return;

  try {
    const user = await prisma.user.findUnique({
      where: { telegramId },
      include: { jobs: true },
    });

    if (!user) return ctx.reply('⚠️ Send /start first.', { parse_mode: 'HTML' });

    const totalPings = await prisma.pingLog.count({ where: { job: { userId: user.id } } });
    const successPings = await prisma.pingLog.count({ where: { job: { userId: user.id }, success: true } });
    const latencies = await prisma.pingLog.findMany({
      where: { job: { userId: user.id }, latency: { not: null } },
      select: { latency: true },
      take: 100,
      orderBy: { timestamp: 'desc' },
    });

    const avgLatency = latencies.length > 0 ? Math.round(latencies.reduce((a, b) => a + (b.latency || 0), 0) / latencies.length) : 0;
    const uptime = totalPings > 0 ? ((successPings / totalPings) * 100).toFixed(1) : '100.0';

    const msg = `
📊 <b>𝗣𝗲𝗿𝗳𝗼𝗿𝗺𝗮𝗻𝗰𝗲 𝗢𝘃𝗲𝗿𝘃𝗶𝗲𝘄</b>

<blockquote>📡 Monitors: ${user.jobs.length} (${user.jobs.filter(j => j.isActive).length} active)
🔄 Total Pings: ${totalPings}
⚡ Avg Latency: ${avgLatency}ms
🟢 Uptime: ${uptime}%</blockquote>

<i>🌐 For detailed charts, use /login to access the web dashboard.</i>
`;
    ctx.reply(msg, { parse_mode: 'HTML' });
  } catch (error) {
    console.error(error);
    ctx.reply('❌ Failed to fetch stats.', { parse_mode: 'HTML' });
  }
});

// ───────────────── /login ─────────────────
bot.command('login', async (ctx) => {
  const telegramId = ctx.from?.id.toString();
  if (!telegramId) return;

  try {
    const user = await prisma.user.findUnique({ where: { telegramId } });
    if (!user) return ctx.reply('⚠️ Send /start first.', { parse_mode: 'HTML' });

    // Generate a session token
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.session.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    const loginUrl = `${WEB_URL}/api/auth/callback?token=${token}`;

    // Try inline keyboard first (works with public URLs), fallback to text link
    try {
      await ctx.reply(
        `🔐 <b>Secure Login Link</b>\n\n<blockquote>Click the button below to access your web dashboard. This link is valid for 7 days and is unique to your account.</blockquote>\n\n⚠️ <i>Do not share this link with anyone.</i>`,
        {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: '🌐 Open Dashboard', url: loginUrl }],
            ],
          },
        }
      );
    } catch {
      // Fallback for localhost/dev URLs that Telegram rejects in inline keyboards
      await ctx.reply(
        `🔐 <b>Secure Login Link</b>\n\n<blockquote>Open the link below in your browser to access the web dashboard. Valid for 7 days.</blockquote>\n\n🌐 <b>Your Link:</b>\n<code>${loginUrl}</code>\n\n<i>📋 Tap the link above to copy, then paste in your browser.</i>\n\n⚠️ <i>Do not share this link with anyone.</i>`,
        { parse_mode: 'HTML' }
      );
    }
  } catch (error) {
    console.error(error);
    ctx.reply('❌ Failed to generate login link.', { parse_mode: 'HTML' });
  }
});

// ═════════════════ PING ENGINE ═════════════════
const PING_CHECK_INTERVAL = 60 * 1000;

const pingEngine = async () => {
  try {
    const activeJobs = await prisma.pingJob.findMany({ where: { isActive: true } });
    const now = new Date();

    for (const job of activeJobs) {
      const shouldPing = !job.lastPing || (now.getTime() - job.lastPing.getTime()) >= job.interval * 60 * 1000;

      if (shouldPing) {
        const startTime = Date.now();
        let success = false;
        let statusCode: number | null = null;
        let latency: number | null = null;

        try {
          const response = await axios.get(job.url, { timeout: 15000 });
          statusCode = response.status;
          success = statusCode >= 200 && statusCode < 400;
          latency = Date.now() - startTime;
        } catch (error: any) {
          if (error.response) statusCode = error.response.status;
          latency = Date.now() - startTime;
        }

        await prisma.pingLog.create({
          data: { jobId: job.id, statusCode, latency, success },
        });

        await prisma.pingJob.update({
          where: { id: job.id },
          data: { lastPing: new Date() },
        });

        console.log(`[PING] ${job.url} → ${statusCode || 'TIMEOUT'} (${latency}ms)`);
      }
    }
  } catch (error) {
    console.error('[PING ENGINE ERROR]:', error);
  }
};

// Start engine
setInterval(pingEngine, PING_CHECK_INTERVAL);
// Run once immediately
pingEngine();
console.log('⚡ Ping Engine Started');

// Set Bot Commands Menu
bot.telegram.setMyCommands([
  { command: 'start', description: 'Welcome to PingBot' },
  { command: 'add', description: 'Start monitoring a URL' },
  { command: 'remove', description: 'Stop monitoring a URL' },
  { command: 'pause', description: 'Temporarily pause a monitor' },
  { command: 'resume', description: 'Resume a paused monitor' },
  { command: 'list', description: 'View your active monitors' },
  { command: 'stats', description: 'Quick performance overview' },
  { command: 'login', description: 'Open the web dashboard' },
  { command: 'help', description: 'Full command reference' }
]).catch(err => console.error('⚠️ Failed to set bot commands:', err.message));

// Self-Ping to Prevent Render Sleep
const RENDER_URL = process.env.RENDER_EXTERNAL_URL || process.env.WEB_URL;
if (RENDER_URL) {
  setInterval(async () => {
    try {
      await axios.get(RENDER_URL);
      console.log(`[SELF-PING] Pinged ${RENDER_URL} to prevent sleep`);
    } catch (e) {
      console.log(`[SELF-PING] Failed to ping ${RENDER_URL}`);
    }
  }, 7 * 60 * 1000); // 7 minutes
}

// Launch bot
bot.launch().then(() => {
  console.log('🤖 Telegram Bot is running!');
}).catch(err => {
  console.error('❌ Failed to launch bot:', err.message);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
