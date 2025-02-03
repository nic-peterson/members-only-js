// auth.js

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

function ensureMember(req, res, next) {
  if (req.isAuthenticated() && req.user.is_member) {
    return next();
  }
  res.redirect("/upgrade/member");
}

function ensureAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.is_admin) {
    return next();
  }
  res.redirect("/upgrade/admin");
}

module.exports = {
  ensureAuthenticated,
  ensureMember,
  ensureAdmin,
};
