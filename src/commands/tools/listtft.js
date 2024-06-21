let listtft = [];

function addPlayerTFT(player) {
  listtft.push(player);
}

function removePlayerTFT(playerId) {
  listtft = listtft.filter(player => player.id !== playerId);
}

function updatePlayerTFT(playerId, newDetails) {
  const index = listtft.findIndex(player => player.id === playerId);
  if (index !== -1) {
    listtft[index] = { ...listtft[index], ...newDetails };
  }
}

function getListTFT() {
  return listtft;
}

module.exports = {
  listtft,
  addPlayerTFT,
  removePlayerTFT,
  updatePlayerTFT,
  getListTFT
};