import { Random } from 'mockjs'
import type { IncomingMessage, ServerResponse } from 'http'

const allAgents = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `代理商${String(i + 1).padStart(3, '0')}`,
  contactPerson: Random.cname(),
  contactPhone: `09${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
  status: i % 5 === 0 ? 'inactive' : ('active' as 'active' | 'inactive'),
  createdAt: Random.datetime('yyyy-MM-dd HH:mm:ss')
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
    url: '/api/agents',
    method: 'get',
    response: ({
      query
    }: {
      query: {
        page?: string
        pageSize?: string
        name?: string
        status?: string
        sortField?: string
        sortOrder?: string
      }
    }) => {
      const page = parseInt(query.page || '1')
      const pageSize = parseInt(query.pageSize || '20')
      const { name = '', status = '', sortField = 'createdAt', sortOrder = 'desc' } = query

      let list = [...allAgents]

      if (name) {
        list = list.filter((a) => a.name.includes(name) || a.contactPerson.includes(name))
      }
      if (status) {
        list = list.filter((a) => a.status === status)
      }

      list.sort((a, b) => {
        const aVal = String(a[sortField as keyof typeof a])
        const bVal = String(b[sortField as keyof typeof b])
        const cmp = aVal.localeCompare(bVal)
        return sortOrder === 'asc' ? cmp : -cmp
      })

      const total = list.length
      const data = list.slice((page - 1) * pageSize, page * pageSize)

      return { data, total, page, pageSize }
    }
  },
  {
    url: '/api/agents',
    method: 'post',
    rawResponse: async (req: IncomingMessage, res: ServerResponse) => {
      const raw = await readBody(req)
      const { name, contactPerson, contactPhone } = JSON.parse(raw || '{}')

      res.setHeader('Content-Type', 'application/json')

      if (!name || !contactPerson || !contactPhone) {
        res.statusCode = 422
        res.end(JSON.stringify({ message: '所有欄位為必填' }))
        return
      }

      const newAgent = {
        id: allAgents.length + 1,
        name,
        contactPerson,
        contactPhone,
        status: 'active' as const,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
      }
      allAgents.unshift(newAgent)

      res.statusCode = 201
      res.end(JSON.stringify(newAgent))
    }
  },
  {
    url: '/api/agents/:id/status',
    method: 'patch',
    rawResponse: async (req: IncomingMessage, res: ServerResponse) => {
      const id = parseInt(req.url?.split('/')[3] || '0')
      const raw = await readBody(req)
      const { status } = JSON.parse(raw || '{}')

      const agent = allAgents.find((a) => a.id === id)
      res.setHeader('Content-Type', 'application/json')

      if (!agent) {
        res.statusCode = 404
        res.end(JSON.stringify({ message: '代理商不存在' }))
        return
      }

      agent.status = status
      res.statusCode = 200
      res.end(JSON.stringify({ id: agent.id, status: agent.status }))
    }
  }
]
