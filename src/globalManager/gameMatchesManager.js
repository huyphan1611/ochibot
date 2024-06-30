class GameMatchesManager {
  static aramMatches = [];
  static customAramMatches = [];
  static tftMatches = [];

  // ARAM Matches
  static setAramMatches(newMatches) {
    this.aramMatches = newMatches;
  }

  static addAramMatch(newMatch) {
    this.aramMatches = [...this.aramMatches, newMatch];
  }

  static getAramMatches() {
    return this.aramMatches;
  }

  // Custom ARAM Matches
  static addCustomAramMatch(newMatch) {
    this.customAramMatches = [...this.customAramMatches, newMatch];
  }

  static getCustomAramMatches() {
    return this.customAramMatches;
  }

  // Get All Available Aram Matches
  static getAllAvailableAramMatches() {
    let allAvailableMatches = [...this.aramMatches, ...this.customAramMatches];

    // Sắp xếp danh sách theo timeEnd
    allAvailableMatches.sort((a, b) => a.timeEnd - b.timeEnd);

    // Loại bỏ các người chơi có cùng userId và timeZ nhỏ hơn
    allAvailableMatches = allAvailableMatches.filter(
      (player, index, self) =>
        index ===
        self.findIndex((p) => p.userId === player.userId && p.timeZ >= 0)
    );

    return allAvailableMatches;
  }

  // TFT Matches
  static setTFTMatches(newMatches) {
    this.tftMatches = newMatches;
  }

  static addTFTMatch(newMatch) {
    this.tftMatches = [...this.tftMatches, newMatch];
  }

  static getTFTMatches() {
    return this.tftMatches;
  }


  static getAllAvailableMatches() {
    let allAvailableMatches = [...this.aramMatches, ...this.customAramMatches, ...this.tftMatches];

    // Sắp xếp danh sách theo timeEnd
    allAvailableMatches.sort((a, b) => a.timeEnd - b.timeEnd);

    // Loại bỏ các người chơi có cùng userId và timeZ nhỏ hơn
    allAvailableMatches = allAvailableMatches.filter(
      (player, index, self) =>
        index ===
        self.findIndex((p) => p.userId === player.userId && p.timeZ >= 0)
    );

    return allAvailableMatches;
  }


}

module.exports = GameMatchesManager;
