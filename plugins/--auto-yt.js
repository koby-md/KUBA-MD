import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import koja from 'koja-api';

const handler = async (m, { args, conn }) => {
  const url = args[0];
  const quality = args[1] || '720p';

  if (!url) return conn.reply(m.chat, '❌ يرجى إدخال رابط الفيديو', m);

  // نحصل على الـ videoId لاستخدامه في الصورة المصغرة
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/);
  if (!match) return conn.reply(m.chat, '❌ الرابط غير صالح', m);
  const id = match[1];
  const thumbnail = `https://i.ytimg.com/vi/${id}/hq720.jpg`;

  try {
    // إرسال الصورة المصغرة مع رسالة انتظار
    await conn.sendMessage(m.chat, {
      image: { url: thumbnail },
      caption: '*⏳ جاري تحميل الفيديو، الرجاء الانتظار...*'
    }, { quoted: m });

    // جلب معلومات الفيديو وروابط التحميل عبر koja-api
    const videoInfo = await koja.ytmp4(url, quality);

    if (!videoInfo.success || !videoInfo.download.status) {
      return conn.reply(m.chat, '❌ لم أتمكن من الحصول على رابط تحميل الفيديو', m);
    }

    const downloadUrl = videoInfo.download.url;

    // تجهيز مسارات الملفات المؤقتة
    if (!fs.existsSync('./tmp')) fs.mkdirSync('./tmp');
    const fileName = `${Date.now()}-${id}.mp4`;
    const filePath = path.join('./tmp', fileName);
    const fixedPath = filePath.replace('.mp4', '_fixed.mp4');

    // تحميل الفيديو مؤقتًا عبر axios
    const response = await axios({
      method: 'GET',
      url: downloadUrl,
      responseType: 'stream',
    });

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    // معالجة الفيديو باستخدام ffmpeg لتحسين التوافق (faststart)
    execSync(`ffmpeg -i "${filePath}" -movflags +faststart -c copy "${fixedPath}"`);

    // إرسال الفيديو بعد المعالجة
    await conn.sendMessage(m.chat, {
      video: { url: fixedPath },
      mimetype: 'video/mp4',
      caption: `📽️ تم تحميل الفيديو: ${videoInfo.metadata.title}`
    }, { quoted: m });

    // حذف الملفات المؤقتة
    fs.unlinkSync(filePath);
    fs.unlinkSync(fixedPath);

  } catch (e) {
    console.error(e);
    conn.reply(m.chat, `❌ حدث خطأ:\n${e.message}`, m);
  }
};

handler.command = ['ytmp4'];
export default handler;