module.exports = async function (req, res) {
  // Nothing except socket requests should ever hit this endpoint.
  if (!req.isSocket) {
    return res.badRequest();
  }

  // Broadcast socket event to everyone else currently online so their user agents
  // can update the UI for them.
  sails.sockets.broadcast('channel' + req.param('id'),
    'stoppedTyping', {});
    
    //, (req.isSocket ? req : undefined) );

  return res.ok();
};