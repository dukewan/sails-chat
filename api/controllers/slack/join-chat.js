module.exports = async function (req, res) {
  if (!req.isSocket) {
    return res.badRequest();
  }
  sails.sockets.join(req, 'channel' + req.param('id'));
  return res.ok();
};
