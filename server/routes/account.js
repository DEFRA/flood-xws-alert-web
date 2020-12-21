module.exports = [
  {
    method: 'GET',
    path: '/account',
    handler: async (request, h) => {
      const { credentials } = request.auth

      return h.view('account', { credentials })
    }
  }
]
