import yts from 'yt-search';
import ddownr from 'denethdev-ytmp3';

const handler = async (m, { conn, text }) => {
  if (!text) {
    return m.reply(JSON.stringify({ error: 'يرجى إدخال اسم الأغنية أو رابط YouTube' }));
  }

  try {
    // البحث في YouTube
    const searchResults = await yts(text);
    if (!searchResults || !searchResults.videos.length) {
      return m.reply(JSON.stringify({ error: 'لم يتم العثور على نتيجة' }));
    }

    const song = searchResults.videos[0];
    const url = song.url;

    // جلب رابط التحميل
    const result = await ddownr.download(url, 'mp3');
    const download_url = result.downloadUrl;
    if (!download_url) {
      return m.reply(JSON.stringify({ error: 'تعذر استخراج رابط التحميل' }));
    }

    // الرسالة النصية
    const infoText = `🎵 *${song.title}*\n👀 ${song.views.toLocaleString()} مشاهدة\n🕒 ${song.timestamp}\n📅 منذ ${song.ago}\n📺 ${song.author.name}\n🔗 ${song.url}`;

    // إرسال الصورة والمعلومات
    await conn.sendMessage(m.chat, {
      image: { url: song.thumbnail },
      caption: infoText
    }, { quoted: m });

    // إرسال الملف الصوتي
    await conn.sendMessage(m.chat, {
      audio: { url: download_url },
      mimetype: 'audio/mpeg',
      fileName: `${song.title}.mp3`
    }, { quoted: m });

  } catch (e) {
    console.error(e);
    m.reply(JSON.stringify({ error: 'حدث خطأ أثناء المعالجة' }));
  }
};

handler.command = ['ytmp3'];
export default handler;