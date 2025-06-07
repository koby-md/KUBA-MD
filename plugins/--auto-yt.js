import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { ytdl } from 'savetubedl';

const handler = async (m, { args, conn }) => {
  const url = args[0];
  const quality = args[1] || '720';

  if (!url) return m.reply('يرجى إدخال رابط الفيديو');

  const cleanUrl = url.split('?')[0]; // حذف أي معلمات
  const match = cleanUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/);
  if (!match) return m.reply('الرابط غير صالح');

  const id = match[1];
  const thumbnail = `https://i.ytimg.com/vi/${id}/hq720.jpg`;

  try {
    await conn.sendMessage(m.chat, {
      image: { url: thumbnail },
      caption: '*_جاري التحميل●●●○○ 🖤 WAIT🩶_*'
    }, { quoted: m });

    const result = await ytdl(url, quality);
    const data = result?.response;
    if (!data?.descarga) throw new Error('فشل الحصول على رابط التحميل');

    const fileName = `${Date.now()}-${id}.mp4`;
    const filePath = path.join('./tmp', fileName);
    const fixedPath = filePath.replace('.mp4', '_fixed.mp4');

    if (!fs.existsSync('./tmp')) fs.mkdirSync('./tmp');

    const response = await axios({
      method: 'GET',
      url: data.descarga,
      responseType: 'stream',
    });

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    execSync(`ffmpeg -i "${filePath}" -movflags +faststart -c copy "${fixedPath}"`);

    await conn.sendMessage(m.chat, {
      video: { url: fixedPath },
      mimetype: 'video/mp4',
      caption: '📽️ تم التحميل بنجاح.'
    }, { quoted: m });

    fs.unlinkSync(filePath);
    fs.unlinkSync(fixedPath);

  } catch (e) {
    console.error(e);
    m.reply(`حدث خطأ:\n${e.message}`);
  }
};

handler.command = ['ytmp4'];
export default handler;