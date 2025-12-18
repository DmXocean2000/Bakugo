module.exports = (client) => {
client.once('clientReady', () => {
  console.log(`${client.user.tag} is online and ready to explode 💥`);
});
}