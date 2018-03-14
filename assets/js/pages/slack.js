parasails.registerPage('slack', {
  data: {
    me: {},
    channels: [],
    messages: [],
    user: null,
    currentChannel: null,
    input: '',
    channelInput: '',
    typing: ''
  },
  beforeMount: function () {
    _.extend(this, window.SAILS_LOCALS);
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
        this.$nextTick(() => {
          $('#comment-wrapper').scrollTo($('#bottom'));
        })
      });

      io.socket.on('typing', (e) => {
        this.typing = e.username;
        this.$nextTick(() => {
          $('#typing-icon')
            .transition('pulse');
        });
      });

      io.socket.on('stoppedTyping', (e) => {
        this.typing = '';
      });
    },
    showCreateModal: function () {
      $('.tiny.modal').modal('show');
    },
    createChannel: function () {
      let self = this;
      if (!this.channelInput) {
        return;
      }
      $.ajax({
        url: '/channel/create?name=' + this.channelInput,
        dataType: 'json',
        success: function (data) {
          $('.tiny.modal').modal('hide');
          self.channelInput = '';
          $.getJSON('/channel', (data) => {
            self.channels = data;
          })
        },
        error: function (jqXHR, status, err) {
          if (jqXHR.responseJSON.code === 'E_UNIQUE') {
            alert('Channel already exists!')
          }
        }
      });
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
      let self = this

      if (!this.me.id) {
        window.location.href = 'signup'
        return;
      }

      if (!this.input) {
        return;
      }
      io.socket.post('/slack/' + this.currentChannel.id + '/chat/' + this.input, (data, JWR) => {
        // If something went wrong, handle the error.
        if (JWR.statusCode !== 200) {
          return;
        }
        this.input = ''
      });
    },
    isTyping: function () {
      if (!this.me.id) {
        return;
      }
      io.socket.request({
        url: '/slack/' + this.currentChannel.id + '/typing',
        method: 'put'
      }, function (data, JWR){
          // If something went wrong, handle the error.
          if (JWR.statusCode !== 200) {
            console.error(JWR);
            return;
          }
      });
    },
    isNotTyping: function () {
      if (!this.me.id) {
        return;
      }
      io.socket.request({
        url: '/slack/'+ this.currentChannel.id +'/stop-typing',
        method: 'put'
      }, function (data, JWR){
          // If something went wrong, handle the error.
          if (JWR.statusCode !== 200) {
            console.error(JWR);
            return;
          }
      });
    }
  },
  filters: {
    getAvatar: function (id) {
      return 'https://api.adorable.io/avatars/256/' + id + '.png';
    },
    getTime: function (createAt) {
      return moment(createAt).calendar();    
    }
  },
  mounted: function () {
    this.load();
    $('.tiny.modal').modal();
  }
});
