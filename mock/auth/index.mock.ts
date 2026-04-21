import type { IncomingMessage, ServerResponse } from 'http'

const accounts = [
  { id: 1, username: 'admin', password: 'admin', email: 'admin@example.com' },
  { id: 2, username: 'test', password: 'test', email: 'test@example.com' }
]

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    let body = ''
    req.on('data', (chunk) => (body += chunk))
    req.on('end', () => resolve(body))
  })
}

export default [
  {
    url: '/api/auth/login',
    method: 'post',
    rawResponse: async (req: IncomingMessage, res: ServerResponse) => {
      const raw = await readBody(req)
      const { username, password } = JSON.parse(raw || '{}')
      const account = accounts.find((a) => a.username === username && a.password === password)

      res.setHeader('Content-Type', 'application/json')
      if (!account) {
        res.statusCode = 401
        res.end(JSON.stringify({ message: '帳號或密碼錯誤' }))
        return
      }
      const { password: _pw, ...user } = account
      res.statusCode = 200
      res.end(
        JSON.stringify({
          token: `mock-token-${user.username}-${Date.now()}`,
          user
        })
      )
    }
  }
]
