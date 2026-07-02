import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type Variables = { userId: string }

const projectsRouter = new Hono<{ Variables: Variables }>()

// Auth middleware — reads x-user-id, upserts user, attaches to context
projectsRouter.use('/api/projects*', async (c, next) => {
  const userId = c.req.header('x-user-id')
  if (!userId) {
    return c.json({ error: 'x-user-id header required' }, 401)
  }
  await prisma.user.upsert({
    where: { id: userId },
    create: { id: userId, email: userId, role: 'unknown' },
    update: {},
  })
  c.set('userId', userId)
  await next()
})

// POST /api/projects — create empty project
projectsRouter.post('/api/projects', async (c) => {
  const userId = c.get('userId')
  let body: { id?: string; groupName?: string; isGroupAssessment?: boolean } = {}
  try {
    body = await c.req.json()
  } catch {
    // body defaults are fine if no JSON provided
  }

  const project = await prisma.assessmentProject.create({
    data: {
      ...(body.id && { id: body.id }),
      userId,
      groupName: body.groupName ?? '',
      isGroupAssessment: body.isGroupAssessment ?? false,
    },
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
      userId: true,
      groupName: true,
      isGroupAssessment: true,
      activeEntityId: true,
      entities: true,
    },
  })

  return c.json(project, 201)
})

// GET /api/projects — list all projects for user
projectsRouter.get('/api/projects', async (c) => {
  const userId = c.get('userId')

  const projects = await prisma.assessmentProject.findMany({
    where: { userId },
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
      groupName: true,
      isGroupAssessment: true,
      activeEntityId: true,
      _count: { select: { entities: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return c.json({ projects })
})

// GET /api/projects/:id — get single project with nested data
projectsRouter.get('/api/projects/:id', async (c) => {
  const userId = c.get('userId')
  const id = c.req.param('id')

  const project = await prisma.assessmentProject.findFirst({
    where: { id, userId },
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
      groupName: true,
      isGroupAssessment: true,
      activeEntityId: true,
      entities: {
        select: {
          id: true,
          name: true,
          parentId: true,
          sectorId: true,
          subSector: true,
          relationshipType: true,
          governanceJson: true,
          valueChainJson: true,
          phase4Json: true,
          phase5Json: true,
          srroItems: true,
        },
      },
    },
  })

  if (!project) {
    return c.json({ error: 'Project not found' }, 404)
  }

  return c.json(project)
})

// PUT /api/projects/:id — full upsert of project state
projectsRouter.put('/api/projects/:id', async (c) => {
  const userId = c.get('userId')
  const id = c.req.param('id')

  let body: {
    groupName?: string
    isGroupAssessment?: boolean
    activeEntityId?: string
    entities?: Array<{
      id: string
      name: string
      parentId: string | null
      sectorId: string
      subSector: string
      relationshipType: string
      governanceJson: string
      valueChainJson: string
      phase4Json: string
      phase5Json: string
      srroItems?: Array<{
        ref: string
        source?: string
        title: string
        description?: string
        type?: string
        valueChainStage?: string
        financialImpact?: string
        strategicImpact?: string
        operationalImpact?: string
        timeHorizon?: string
        likelihood?: number
        magnitude?: number
        neededByPrimaryUser?: string
        includeInFinalList?: string
        srroCrro?: string
      }>
    }>
  }

  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  await prisma.assessmentProject.upsert({
    where: { id },
    create: {
      id,
      userId,
      groupName: body.groupName ?? '',
      isGroupAssessment: body.isGroupAssessment ?? false,
      activeEntityId: body.activeEntityId ?? undefined,
    },
    update: {
      ...(body.groupName !== undefined && { groupName: body.groupName }),
      ...(body.isGroupAssessment !== undefined && { isGroupAssessment: body.isGroupAssessment }),
      ...(body.activeEntityId !== undefined && { activeEntityId: body.activeEntityId }),
    },
  })

  if (Array.isArray(body.entities)) {
    for (const entity of body.entities) {
      const entityData = {
        name: entity.name,
        parentId: entity.parentId ?? null,
        sectorId: entity.sectorId,
        subSector: entity.subSector,
        relationshipType: entity.relationshipType,
        governanceJson: entity.governanceJson,
        valueChainJson: entity.valueChainJson,
        phase4Json: entity.phase4Json,
        phase5Json: entity.phase5Json,
      }

      await prisma.entity.upsert({
        where: { id: entity.id },
        create: { id: entity.id, projectId: id, ...entityData },
        update: entityData,
      })

      if (Array.isArray(entity.srroItems)) {
        for (const item of entity.srroItems) {
          const itemData = {
            source: item.source ?? '',
            title: item.title,
            description: item.description ?? '',
            type: item.type ?? '',
            valueChainStage: item.valueChainStage ?? '',
            financialImpact: item.financialImpact ?? '',
            strategicImpact: item.strategicImpact ?? '',
            operationalImpact: item.operationalImpact ?? '',
            timeHorizon: item.timeHorizon ?? '',
            likelihood: item.likelihood ?? 1,
            magnitude: item.magnitude ?? 1,
            neededByPrimaryUser: item.neededByPrimaryUser ?? '',
            includeInFinalList: item.includeInFinalList ?? '',
            srroCrro: item.srroCrro ?? '',
          }

          await prisma.srroItem.upsert({
            where: { entityId_ref: { entityId: entity.id, ref: item.ref } },
            create: { entityId: entity.id, ref: item.ref, ...itemData },
            update: itemData,
          })
        }
      }
    }
  }

  const updated = await prisma.assessmentProject.findFirst({
    where: { id, userId },
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
      groupName: true,
      isGroupAssessment: true,
      activeEntityId: true,
      entities: {
        select: {
          id: true,
          name: true,
          parentId: true,
          sectorId: true,
          subSector: true,
          relationshipType: true,
          governanceJson: true,
          valueChainJson: true,
          phase4Json: true,
          phase5Json: true,
          srroItems: true,
        },
      },
    },
  })

  return c.json(updated)
})

// DELETE /api/projects/:id — cascade delete via schema
projectsRouter.delete('/api/projects/:id', async (c) => {
  const userId = c.get('userId')
  const id = c.req.param('id')

  const existing = await prisma.assessmentProject.findFirst({ where: { id, userId } })
  if (!existing) {
    return c.json({ error: 'Project not found' }, 404)
  }

  await prisma.assessmentProject.delete({ where: { id } })

  return new Response(null, { status: 204 })
})

export default projectsRouter
