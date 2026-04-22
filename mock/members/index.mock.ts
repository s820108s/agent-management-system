import { Random } from 'mockjs'
import type { IncomingMessage, ServerResponse } from 'http'

const allMembers = Array.from({ length: 80 }, (_, i) => ({
  id: i + 1,
  username: `member${String(i + 1).padStart(3, '0')}`,
  email: `member${String(i + 1).padStart(3, '0')}@example.com`,
  agentId: (i % 40) + 1,
  agentName: `代理商${String((i % 40) + 1).padStart(3, '0')}`,
  status: i % 10 === 0 ? 'inactive' : ('active' as 'active' | 'inactive'),
  createdAt: Random.datetime('yyyy-MM-dd HH:mm:ss')
}))

const activeAgents = Array.from({ length: 40 }, (_, i) => ({
  id: i + 1,
  name: `代理商${String(i + 1).padStart(3, '0')}`
}))

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    let body = ''
    req.on('data', (chunk) => (body += chunk))
    req.on('end', () => resolve(body))
  })
}

export default [
  {
    url: '/api/members',
    method: 'get',
    response: ({
      query
    }: {
      query: {
        page?: string
        pageSize?: string
        keyword?: string
        agentId?: string
      }
    }) => {
      const page = parseInt(query.page || '1')
      const pageSize = parseInt(query.pageSize || '20')
      const { keyword = '', agentId = '' } = query

      let list = [...allMembers]

      if (keyword) {
        list = list.filter((m) => m.username.includes(keyword) || m.email.includes(keyword))
      }
      if (agentId) {
        list = list.filter((m) => String(m.agentId) === String(agentId))
      }

      const total = list.length
      const data = list.slice((page - 1) * pageSize, page * pageSize)

      return { data, total, page, pageSize }
    }
  },
  {
    url: '/api/members',
    method: 'post',
    rawResponse: async (req: IncomingMessage, res: ServerResponse) => {
      const raw = await readBody(req)
      const { username, email, password, agentId } = JSON.parse(raw || '{}')

      res.setHeader('Content-Type', 'application/json')

      if (!username || !email || !password || !agentId) {
        res.statusCode = 422
        res.end(JSON.stringify({ message: '所有欄位為必填' }))
        return
      }

      const duplicate = allMembers.find((m) => m.email === email)
      if (duplicate) {
        res.statusCode = 409
        res.end(JSON.stringify({ message: '此 Email 已被使用' }))
        return
      }

      const agent = activeAgents.find((a) => String(a.id) === String(agentId))
      const newMember = {
        id: allMembers.length + 1,
        username,
        email,
        agentId: Number(agentId),
        agentName: agent?.name ?? '',
        status: 'active' as const,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
      }
      allMembers.unshift(newMember)

      res.statusCode = 201
      res.end(JSON.stringify(newMember))
    }
  },
  {
    url: '/api/agents/all',
    method: 'get',
    response: () => {
      return { data: activeAgents }
    }
  }
]
