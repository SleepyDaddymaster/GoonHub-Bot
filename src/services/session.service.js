class SessionService {
  constructor() {
    this.sessions = new Map();
  }

  create(userId, data) {
    this.sessions.set(userId, data);
  }

  get(userId) {
    return this.sessions.get(userId);
  }

  update(userId, data) {
    const old = this.sessions.get(userId) || {};
    this.sessions.set(userId, { ...old, ...data });
  }

  delete(userId) {
    this.sessions.delete(userId);
  }
}

module.exports = new SessionService();