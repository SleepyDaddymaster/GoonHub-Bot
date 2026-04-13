class GiveawayManager {
  constructor() {
    this.giveaways = new Map();
  }

  create(id, data) {
    this.giveaways.set(id, data);
  }

  get(id) {
    return this.giveaways.get(id);
  }

  delete(id) {
    this.giveaways.delete(id);
  }

  end(id) {
    const g = this.giveaways.get(id);
    if (!g) return null;

    this.giveaways.delete(id);
    return g;
  }
}

module.exports = new GiveawayManager();