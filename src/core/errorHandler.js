module.exports = async (i, err) => {
  console.error(err);
  if (!i.replied) {
    i.reply({ content: "❌ Fehler", ephemeral: true });
  }
};