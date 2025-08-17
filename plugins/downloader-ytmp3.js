import ddownr from 'denethdev-ytmp3';

const handler = async (m, { conn, text }) => {
  if (!text) {
    return m.reply(JSON.stringify({ error: 'يرجى إدخال رابط YouTube' }));
  }
m.reply(wait);
  try {
    // جلب رابط التحميل مباشرة من رابط الفيديو
    const result = await ddownr.download(text, 'mp3');
    const download_url = result.downloadUrl;
    const title = result.title || 'audio.mp3';

    if (!download_url) {
      return m.reply(JSON.stringify({ error: 'تعذر استخراج رابط التحميل' }));
    }

    // إرسال الملف الصوتي فقط
    await conn.sendMessage(m.chat, {
      audio: { url: download_url },
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`
    }, { quoted: m });

  } catch (e) {
    console.error(e);
    m.reply(JSON.stringify({ error: 'حدث خطأ أثناء المعالجة' }));
  }
};

handler.command = ['yt'];
export default handler;