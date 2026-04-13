module.exports = {
  name: "messageDelete",
  execute(client, msg) {
    console.log(`Deleted: ${msg.content}`);
  }
};