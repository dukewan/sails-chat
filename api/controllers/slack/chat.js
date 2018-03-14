module.exports = async function (req, res) {
  if (!req.isSocket) {
    return res.badRequest();
  }

  let createdChat = await Chat.create({
    message: req.param('message'),
    sender: req.me.id,
    channel: +req.param('id')
  })
  .fetch();
  createdChat = await Chat.findOne({ id: createdChat.id }).populate('sender');
  
  User.findOne({
    id: req.me.id
  }).exec((err, foundUser) => {
    if (err) {
      return res.negotiate(err);
    }
    if (!foundUser) {
      return res.notFound();
    }

    // Broadcast WebSocket event to everyone else currently online so their user 
    // agents can update the UI for them.
    sails.sockets.broadcast('channel' + req.param('id'), 'chat', {
      message: createdChat
    });

    return res.ok();
  });
};
