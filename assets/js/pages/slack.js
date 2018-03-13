var app = new Vue({
  el: '#slack',
  data: {
    channels: [],
    messages: [],
    user: null,
    currentChannel: null
  },
  methods: {
    load: function () {
      var self = this;
      $.getJSON('/channel', (data) => {
        self.channels = data;
        self.changeChannel(1);
      });

      io.socket.on('chat', (e) => {
        // Append the chat we just received    
        this.messages.push(e.message);
      });
    },
    createChannel: function () {
      
    },
    changeChannel: function (id) {
      var self = this;
      this.currentChannel = _.find(this.channels, { id: id });
      $.getJSON('/chat?where={"channel":' + id + '}',  (data) => {
        self.messages = data;
      });

      io.socket.put('/slack/'+ this.currentChannel.id + '/join', (data, JWR) => {
        // If something went wrong, handle the error.
        if (JWR.statusCode !== 200) {
          console.error(JWR);
          // TODO
          return;
        }
      });

      
    },
    sendMessage: function () {
      io.socket.post('/slack/' + this.currentChannel.id + '/chat/' + 'hello world', (data, JWR) => {
        // If something went wrong, handle the error.
        if (JWR.statusCode !== 200) {
          console.error(JWR);
          return;
        }
      });
    },
  },
  mounted: function () {
    this.load();
  }
});
