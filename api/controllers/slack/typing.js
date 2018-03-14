module.exports = async function (req, res) {
  // Nothing except socket requests should ever hit this endpoint.
  if (!req.isSocket) {
    return res.badRequest();
  }

  User.findOne({
    id: req.me.id
  }).exec(function (err, foundUser){
    if (err) return res.negotiate(err);
    if (!foundUser) return res.notFound();

    // Broadcast socket event to everyone else currently online so their user agents
    // can update the UI for them.
    sails.sockets.broadcast('channel' + req.param('id'), 'typing', {
      username: foundUser.fullName
    });
    //, (req.isSocket ? req : undefined) );

    return res.ok();
  });
};