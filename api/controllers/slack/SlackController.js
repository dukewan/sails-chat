/**
 * SlackController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  exits: {
    success: {
      viewTemplatePath: 'pages/slack',
    }
  },
  fn: async function (inputs, exits) {
    exits.success({ user: this.req.me });
  }
};

