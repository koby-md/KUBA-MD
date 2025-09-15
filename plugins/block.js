conn.ev.on("call", async (json) => {
  for (let id of json) {
    if (id.status === "offer") {
      let msg = await conn.sendMessage(id.from, {
        text: "`نعتذر، في الوقت الحالي لا يمكننا استقبال المكالمات، سواء كانت في مجموعة أو خاصة.\n\nإذا كنت بحاجة إلى مساعدة أو طلب  ميزة، يرجى مراسلة المالك. الاتصال بالبوتات ليس من الجيد  لانك تزعج صاحب البوت المرجو احترام سياسة استخدام البوتات سيتم حظرك حاليا حتى لا تعيد الكرة مجددا مع اي بوت كان`\n\n https://www.instagram.com/kobysiimo1\n تعال لي في الانستغرام وقل لي  ان البوت قام بحظرك   🥲",
      });

      conn.sendContact(id.from, global.owner, msg);
      await conn.rejectCall(id.id, id.from); // Block the user

      await conn.updateBlockStatus(id.from, "block");
    }
  }
});