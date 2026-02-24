'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { Loader2, AlertCircle, LayoutTemplate } from 'lucide-react'
import TopNav from './_components/TopNav'
import EndpointList from './_components/EndpointList'
import EndpointEditor from './_components/EndpointEditor'
import StatsBar from './_components/StatsBar'
import { type MockEndpoint } from './_components/EndpointList'
import { useToast } from '@/components/Toast'
import {
  getProject,
  getMock,
  createMock,
  updateMock,
  deleteMock,
  duplicateMock,
  createMockResponse,
  updateMockResponse,
  deleteMockResponse,
  getMockResponses,
  parseResponseHeaders,
  parseConditions,
  friendlyApiError,
  type ProjectDetail,
  type MockResponse,
  type Condition,
} from '@/lib/api'

const DEFAULT_BODY = `{
  "success": true,
  "data": {}
}`

function apiMockToLocal(mock: any, defaultResponse?: MockResponse | null): MockEndpoint & { _mockId: string; _responseId: string | null; is_active: number } {
  const headers = defaultResponse?.headers
    ? Object.entries(parseResponseHeaders(defaultResponse.headers)).map(([key, value]) => ({ key, value: value as string }))
    : [{ key: 'Content-Type', value: 'application/json' }]

  const expectedHeadersObj = mock.expected_headers ? parseResponseHeaders(mock.expected_headers) : {}
  const expectedHeaders = Object.keys(expectedHeadersObj).length > 0
    ? Object.entries(expectedHeadersObj).map(([key, value]) => ({ key, value: value as string }))
    : [{ key: '', value: '' }]

  return {
    id: mock.mock_id,
    method: mock.method,
    path: mock.path,
    name: mock.name,
    statusCode: defaultResponse?.status_code ?? 200,
    delay: mock.response_delay_ms ?? 0,
    body: defaultResponse?.body ?? DEFAULT_BODY,
    headers,
    contentType: mock.response_type === 'json' ? 'application/json'
      : mock.response_type === 'xml' ? 'application/xml'
        : mock.response_type === 'html' ? 'text/html' : 'application/json',
    requestBody: mock.expected_body ?? '',
    requestBodyContentType: 'application/json',
    expectedHeaders,
    is_active: mock.is_active ?? 1,
    _mockId: mock.mock_id,
    _responseId: defaultResponse?.response_id ?? null,
  }
}

const ProjectPage = () => {
  const params = useParams()
  const projectId = params?.project_id as string
  const { getToken } = useAuth()
  const toast = useToast()

  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [endpoints, setEndpoints] = useState<(MockEndpoint & { _mockId: string; _responseId: string | null; is_active: number })[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDuplicating, setIsDuplicating] = useState(false)

  // Per-mock responses
  const [responsesMap, setResponsesMap] = useState<Record<string, MockResponse[]>>({})
  const [activeResponseId, setActiveResponseId] = useState<string | null>(null)
  const [conditions, setConditions] = useState<Condition[]>([])

  // ── Load project + mocks ──────────────────────────────────────────────
  const loadProject = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const token = await getToken()
      if (!token) throw new Error('Not authenticated')

      const proj = await getProject(token, projectId)
      setProject(proj)

      const newResponsesMap: Record<string, MockResponse[]> = {}
      const fullMocks = await Promise.all(
        (proj.mocks ?? []).map(async (m) => {
          try {
            const detail = await getMock(token, m.mock_id)
            const responses = detail.responses ?? []
            const defaultResp = responses.find(r => r.is_default === 1) ?? responses[0] ?? null
            newResponsesMap[m.mock_id] = responses
            return apiMockToLocal(detail, defaultResp)
          } catch {
            return apiMockToLocal(m)
          }
        })
      )

      setResponsesMap(newResponsesMap)
      setEndpoints(fullMocks)
      if (fullMocks[0]) {
        setActiveId(fullMocks[0].id)
        const resps = newResponsesMap[fullMocks[0].id] ?? []
        const defaultResp = resps.find(r => r.is_default === 1) ?? resps[0]
        setActiveResponseId(defaultResp?.response_id ?? null)
      }
    } catch (err: any) {
      setError(friendlyApiError(err))
      toast.error(friendlyApiError(err))
    } finally {
      setLoading(false)
    }
  }, [getToken, projectId])

  useEffect(() => { loadProject() }, [loadProject])

  // When active endpoint changes, set active response to its default
  useEffect(() => {
    if (!activeId) return
    const resps = responsesMap[activeId] ?? []
    const def = resps.find(r => r.is_default === 1) ?? resps[0]
    setActiveResponseId(def?.response_id ?? null)
    setConditions(def ? parseConditions(def.conditions) : [])
  }, [activeId])

  // ── Add new endpoint ──────────────────────────────────────────────────
  const handleAdd = async () => {
    try {
      setIsAdding(true)
      const token = await getToken()
      if (!token) return
      const newMock = await createMock(token, projectId, {
        name: 'New endpoint',
        path: '/api/new-endpoint',
        method: 'GET',
        responseType: 'json',
        responseDelay: 0,
      })
      const newResponse = await createMockResponse(token, newMock.mock_id, {
        name: 'Default',
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: DEFAULT_BODY,
        isDefault: true,
      })
      const local = apiMockToLocal(newMock, newResponse)
      setEndpoints(prev => [...prev, local])
      setResponsesMap(prev => ({ ...prev, [local.id]: [newResponse] }))
      setActiveId(local.id)
      setActiveResponseId(newResponse.response_id)
    } catch (err: any) {
      toast.error(friendlyApiError(err))
    } finally {
      setIsAdding(false)
    }
  }

  // ── Delete endpoint ───────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id)
      const token = await getToken()
      if (!token) return
      await deleteMock(token, id)
      setEndpoints(prev => {
        const next = prev.filter(ep => ep.id !== id)
        if (activeId === id) {
          setActiveId(next[0]?.id ?? null)
        }
        return next
      })
      setResponsesMap(prev => { const n = { ...prev }; delete n[id]; return n })
    } catch (err: any) {
      toast.error(friendlyApiError(err))
    } finally {
      setDeletingId(null)
    }
  }

  // ── Toggle isActive ───────────────────────────────────────────────────
  const handleToggleActive = async (newActive: boolean) => {
    if (!activeId) return
    try {
      const token = await getToken()
      if (!token) return
      await updateMock(token, activeId, { isActive: newActive })
      setEndpoints(prev => prev.map(ep =>
        ep.id === activeId ? { ...ep, is_active: newActive ? 1 : 0 } : ep
      ))
    } catch (err: any) {
      toast.error(friendlyApiError(err))
    }
  }

  // ── Response: select ─────────────────────────────────────────────────
  const handleResponseSelect = (r: MockResponse) => {
    if (!activeId) return
    setActiveResponseId(r.response_id)
    setConditions(parseConditions(r.conditions))
    setEndpoints(prev => prev.map(ep =>
      ep.id === activeId ? {
        ...ep,
        statusCode: r.status_code,
        body: r.body,
        headers: Object.entries(parseResponseHeaders(r.headers)).map(([key, value]) => ({ key, value: value as string })),
        _responseId: r.response_id,
      } : ep
    ))
  }

  // ── Response: add ────────────────────────────────────────────────────
  const handleResponseAdd = async () => {
    if (!activeId) return
    const token = await getToken()
    if (!token) return
    const newResp = await createMockResponse(token, activeId, {
      name: `Response ${(responsesMap[activeId]?.length ?? 0) + 1}`,
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: DEFAULT_BODY,
      isDefault: false,
    })
    setResponsesMap(prev => ({ ...prev, [activeId]: [...(prev[activeId] ?? []), newResp] }))
  }

  // ── Response: delete ─────────────────────────────────────────────────
  const handleResponseDelete = async (responseId: string) => {
    if (!activeId) return
    const token = await getToken()
    if (!token) return
    await deleteMockResponse(token, activeId, responseId)
    setResponsesMap(prev => {
      const updated = (prev[activeId] ?? []).filter(r => r.response_id !== responseId)
      // If deleted the active response, switch to first
      if (activeResponseId === responseId) {
        const next = updated[0]
        setActiveResponseId(next?.response_id ?? null)
        if (next) handleResponseSelect(next)
      }
      return { ...prev, [activeId]: updated }
    })
  }

  // ── Response: set default ────────────────────────────────────────────
  const handleResponseSetDefault = async (responseId: string) => {
    if (!activeId) return
    const token = await getToken()
    if (!token) return
    await updateMockResponse(token, activeId, responseId, { isDefault: true })
    setResponsesMap(prev => ({
      ...prev,
      [activeId]: (prev[activeId] ?? []).map(r => ({ ...r, is_default: r.response_id === responseId ? 1 : 0 })),
    }))
  }

  // ── Response: weight change ──────────────────────────────────────────
  const handleResponseWeightChange = async (responseId: string, weight: number) => {
    if (!activeId) return
    const token = await getToken()
    if (!token) return
    await updateMockResponse(token, activeId, responseId, { weight })
    setResponsesMap(prev => ({
      ...prev,
      [activeId]: (prev[activeId] ?? []).map(r => r.response_id === responseId ? { ...r, weight } : r),
    }))
  }

  // ── Duplicate mock ────────────────────────────────────────────────────
  const handleDuplicate = async () => {
    if (!activeId) return
    try {
      setIsDuplicating(true)
      const token = await getToken()
      if (!token) return
      const cloned = await duplicateMock(token, activeId)
      // Fetch its default response
      const detail = await getMock(token, cloned.mock_id)
      const responses = detail.responses ?? []
      const defaultResp = responses.find(r => r.is_default === 1) ?? responses[0] ?? null
      const local = apiMockToLocal(detail, defaultResp)
      setEndpoints(prev => [...prev, local])
      setResponsesMap(prev => ({ ...prev, [local.id]: responses }))
      setActiveId(local.id)
      setActiveResponseId(defaultResp?.response_id ?? null)
    } catch (err: any) {
      toast.error(friendlyApiError(err))
    } finally {
      setIsDuplicating(false)
    }
  }

  // ── Local state update (unsaved) ──────────────────────────────────────
  const handleChange = (updated: MockEndpoint) => {
    setEndpoints(prev => prev.map(ep => ep.id === updated.id ? { ...ep, ...updated } : ep))
    setSaveError(null)
  }

  // ── Save ──────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const ep = endpoints.find(e => e.id === activeId)
    if (!ep) return
    try {
      setSaving(true)
      setSaveError(null)
      const token = await getToken()
      if (!token) throw new Error('Not authenticated')

      const expectedHeadersObj: Record<string, string> = {}
      ep.expectedHeaders.forEach(h => { if (h.key) expectedHeadersObj[h.key] = h.value })

      await updateMock(token, ep.id, {
        name: ep.name,
        path: ep.path,
        method: ep.method,
        responseDelay: ep.delay,
        responseType: ep.contentType.includes('json') ? 'json'
          : ep.contentType.includes('xml') ? 'xml'
            : ep.contentType.includes('html') ? 'html' : 'text',
        expectedBody: ep.requestBody,
        expectedHeaders: JSON.stringify(expectedHeadersObj),
      })

      const headersObj: Record<string, string> = {}
      ep.headers.forEach(h => { if (h.key) headersObj[h.key] = h.value })

      const responsePayload = {
        name: 'Default',
        statusCode: ep.statusCode,
        headers: headersObj,
        body: ep.body,
        isDefault: true,
        conditions: conditions,
      }

      if (ep._responseId) {
        await updateMockResponse(token, ep.id, ep._responseId, responsePayload)
        // Sync the responses map
        setResponsesMap(prev => ({
          ...prev,
          [ep.id]: (prev[ep.id] ?? []).map(r =>
            r.response_id === ep._responseId
              ? { ...r, status_code: ep.statusCode, body: ep.body, headers: JSON.stringify(headersObj) }
              : r
          ),
        }))
      } else {
        const newResp = await createMockResponse(token, ep.id, responsePayload)
        setEndpoints(prev => prev.map(e => e.id === ep.id ? { ...e, _responseId: newResp.response_id } : e))
        setResponsesMap(prev => ({ ...prev, [ep.id]: [newResp] }))
        setActiveResponseId(newResp.response_id)
      }
    } catch (err: any) {
      setSaveError(friendlyApiError(err))
      toast.error(friendlyApiError(err))
    } finally {
      setSaving(false)
    }
  }

  const activeEndpoint = endpoints.find(ep => ep.id === activeId) ?? null
  const activeResponses = activeId ? (responsesMap[activeId] ?? []) : []

  if (loading) {
    return (
      <div className="flex-1 h-screen bg-background flex items-center justify-center gap-2 text-muted-foreground">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-sm">Loading project…</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 h-screen bg-background flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <AlertCircle size={22} className="text-destructive" />
        <p className="text-sm">{error}</p>
        <button onClick={loadProject} className="text-xs text-primary hover:underline cursor-pointer">Retry</button>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 h-screen overflow-hidden bg-background">
      <TopNav
        projectName={project?.name ?? projectId}
        projectSlug={project?.slug ?? projectId}
        saving={saving}
        saveError={saveError}
        onSave={handleSave}
      />
      <StatsBar projectId={projectId} />

      <div className="flex flex-1 overflow-hidden">
        <EndpointList
          endpoints={endpoints}
          activeId={activeId}
          onSelect={setActiveId}
          onAdd={handleAdd}
          onDelete={handleDelete}
          isAdding={isAdding}
          deletingId={deletingId}
        />

        <div className="flex-1 flex overflow-hidden">
          {activeEndpoint ? (
            <EndpointEditor
              key={activeEndpoint.id}
              endpoint={activeEndpoint}
              onChange={handleChange}
              projectSlug={project?.slug ?? projectId}
              mockId={activeEndpoint.id}   // real mock_id for Logs tab
              responses={activeResponses}
              activeResponseId={activeResponseId}
              onResponseSelect={handleResponseSelect}
              onResponseAdd={handleResponseAdd}
              onResponseDelete={handleResponseDelete}
              onResponseSetDefault={handleResponseSetDefault}
              onResponseWeightChange={handleResponseWeightChange}
              onDelete={() => handleDelete(activeEndpoint.id)}
              onToggleActive={handleToggleActive}
              onDuplicate={handleDuplicate}
              isDuplicating={isDuplicating}
              isDeleting={deletingId === activeEndpoint.id}
              conditions={conditions}
              onConditionsChange={setConditions}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                <LayoutTemplate size={22} className="text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">No endpoint selected</p>
                <p className="text-xs text-muted-foreground mt-0.5">Select one from the list or create a new one</p>
              </div>
              <button
                onClick={handleAdd}
                className="mt-2 px-4 py-1.5 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors cursor-pointer"
              >
                Add endpoint
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProjectPage