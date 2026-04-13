class PermissionService {
  static has(member, permission) {
    return member.permissions.has(permission);
  }

  static require(i, permission) {
    if (!i.member.permissions.has(permission)) {
      i.reply({ content: "❌ Keine Berechtigung", ephemeral: true });
      return false;
    }
    return true;
  }
}

module.exports = PermissionService;