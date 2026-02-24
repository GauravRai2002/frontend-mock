/**
 * MockBird API Client
 * Typed wrappers around every backend endpoint.
 * All protected calls require a Clerk session token passed as `token`.
 */

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3001'

// ─── Types ────────────────────────────────────────────────────────────────

export interface UserProfile {
    userId: string
    email: string
    name: string
    imageUrl: string | null
    subscriptionTier: string
    createdAt: string
    orgId: string | null
    orgRole: string | null
    orgName: string | null
    orgSlug: string | null
}

export interface Organization {
    orgId: string
    name: string
    slug: string
    imageUrl: string | null
    membersCount: number
    createdAt: string
}

export interface OrgMember {
    membershipId: string
    role: string
    joinedAt: string
    user: {
        userId: string
        firstName: string
        lastName: string
        email: string
        imageUrl: string | null
    }
}

export interface OrgInvitation {
    id: string
    emailAddress: string
    role: string
    status: string
    createdAt: string
}

export interface Condition {
    type: 'header' | 'query' | 'body' | 'path'
    field: string
    operator: 'equals' | 'contains' | 'regex'
    value: string
}

export interface OrgMembersResponse {
    data: OrgMember[]
    totalCount: number
    limit: number
    offset: number
}

export interface Project {
    project_id: string
    name: string
    description: string
    slug: string
    user_id: string
    org_id: string | null
    is_public: number
    mock_count: number
    created_at: string
    updated_at: string
}

export interface MockSummary {
    mock_id: string
    name: string
    path: string
    method: string
    is_active: number
    response_type: string
    response_delay_ms: number
}

export interface ProjectDetail extends Project {
    mocks: MockSummary[]
}

export interface MockStatEntry {
    mock_id: string
    name: string
    path: string
    method: string
    total_requests: number
    last_request_at: string | null
    avg_response_time_ms: number
}

export interface ProjectStats {
    projectId: string
    totalRequests: number
    lastRequestAt: string | null
    mocks: MockStatEntry[]
}

export interface Mock {
    mock_id: string
    project_id: string
    name: string
    path: string
    method: string
    description: string
    is_active: number
    response_type: string
    response_delay_ms: number
    response_count?: number
    created_at: string
    updated_at: string
}

export interface MockResponse {
    response_id: string
    mock_id: string
    name: string
    status_code: number
    /** JSON string — parse before use */
    headers: string
    body: string
    is_default: number
    weight: number
    /** JSON string — array of Condition objects */
    conditions: string
    created_at: string
}

export interface MockDetail extends Mock {
    responses: MockResponse[]
}

export interface RequestLog {
    log_id: string
    mock_id: string
    project_id: string
    request_path: string
    request_method: string
    request_headers: string
    request_body: string
    request_query: string
    response_status: number
    response_time_ms: number
    ip_address: string
    user_agent: string
    created_at: string
}

export interface RequestLogsResponse {
    data: RequestLog[]
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
    }
}

// ─── Custom Error ─────────────────────────────────────────────────────────

export class ApiError extends Error {
    status: number
    retryAfterMs?: number

    constructor(message: string, status: number, retryAfterMs?: number) {
        super(message)
        this.name = 'ApiError'
        this.status = status
        this.retryAfterMs = retryAfterMs
    }
}

/** Human-friendly error message for display in toasts */
export function friendlyApiError(err: unknown): string {
    if (err instanceof ApiError) {
        if (err.status === 429) {
            if (err.retryAfterMs) {
                const secs = Math.ceil(err.retryAfterMs / 1000)
                if (secs < 60) {
                    return `Rate limit exceeded. Please try again in ${secs} second${secs > 1 ? 's' : ''}.`
                }
                const mins = Math.ceil(secs / 60)
                return `Rate limit exceeded. Please try again in ${mins} minute${mins > 1 ? 's' : ''}.`
            }
            return 'Rate limit exceeded. Please try again later.'
        }
        if (err.status === 403) return 'You don\'t have permission to perform this action.'
        if (err.status === 404) return 'The requested resource was not found.'
        if (err.status === 401) return 'Your session has expired. Please sign in again.'
        return err.message || `Something went wrong (${err.status}).`
    }
    if (err instanceof Error) return err.message
    return 'An unexpected error occurred.'
}

async function apiFetch<T>(
    path: string,
    token: string,
    options: RequestInit = {}
): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            ...(options.headers ?? {}),
        },
    })

    if (!res.ok) {
        const body = await res.json().catch(() => ({ error: res.statusText }))

        // Rate limit — extract retryAfterMs from body or header
        if (res.status === 429) {
            const retryAfterMs = body?.retryAfterMs
                ?? (res.headers.get('Retry-After') ? Number(res.headers.get('Retry-After')) * 1000 : undefined)
            throw new ApiError(
                body?.message ?? 'Rate limit exceeded',
                429,
                retryAfterMs
            )
        }

        throw new ApiError(body?.error ?? `API error ${res.status}`, res.status)
    }

    if (res.status === 204) return undefined as T
    return res.json() as Promise<T>
}

// ─── Auth ─────────────────────────────────────────────────────────────────

/** Sync Clerk user to DB and return their profile. Call once after every login. */
export async function syncUser(token: string): Promise<UserProfile> {
    return apiFetch<UserProfile>('/auth/me', token)
}

/** Update display name (syncs to both Clerk and local DB). */
export async function updateProfile(
    token: string,
    payload: { firstName?: string; lastName?: string }
): Promise<{ userId: string; name: string; firstName: string; lastName: string; imageUrl: string | null }> {
    return apiFetch('/auth/profile', token, {
        method: 'PATCH',
        body: JSON.stringify(payload),
    })
}

// ─── Organizations ────────────────────────────────────────────────────────

export async function getOrganization(token: string, orgId: string): Promise<Organization> {
    return apiFetch<Organization>(`/organizations/${orgId}`, token)
}

export async function getOrganizationMembers(
    token: string,
    orgId: string,
    opts?: { limit?: number; offset?: number }
): Promise<OrgMembersResponse> {
    const params = new URLSearchParams()
    if (opts?.limit) params.set('limit', String(opts.limit))
    if (opts?.offset) params.set('offset', String(opts.offset))
    const qs = params.toString()
    return apiFetch<OrgMembersResponse>(`/organizations/${orgId}/members${qs ? `?${qs}` : ''}`, token)
}

export async function createOrganization(
    token: string,
    payload: { name: string; slug?: string }
): Promise<Organization> {
    return apiFetch<Organization>('/organizations', token, {
        method: 'POST',
        body: JSON.stringify(payload),
    })
}

export async function inviteOrgMember(
    token: string,
    orgId: string,
    payload: { emailAddress: string; role?: string }
): Promise<OrgInvitation> {
    return apiFetch<OrgInvitation>(`/organizations/${orgId}/invitations`, token, {
        method: 'POST',
        body: JSON.stringify(payload),
    })
}

export async function removeOrgMember(
    token: string,
    orgId: string,
    membershipId: string
): Promise<void> {
    await apiFetch<void>(`/organizations/${orgId}/members/${membershipId}`, token, {
        method: 'DELETE',
    })
}

export async function updateOrgMemberRole(
    token: string,
    orgId: string,
    membershipId: string,
    payload: { role: string }
): Promise<OrgMember> {
    return apiFetch<OrgMember>(`/organizations/${orgId}/members/${membershipId}`, token, {
        method: 'PUT',
        body: JSON.stringify(payload),
    })
}

// ─── Projects ─────────────────────────────────────────────────────────────

export async function getProjects(token: string, search?: string): Promise<Project[]> {
    const qs = search ? `?search=${encodeURIComponent(search)}` : ''
    const res = await apiFetch<{ data: Project[] }>(`/projects${qs}`, token)
    return res.data
}

export async function createProject(
    token: string,
    payload: { name: string; description?: string; isPublic?: boolean }
): Promise<Project> {
    const res = await apiFetch<{ data: Project }>('/projects', token, {
        method: 'POST',
        body: JSON.stringify(payload),
    })
    return res.data
}

export async function getProject(token: string, id: string): Promise<ProjectDetail> {
    const res = await apiFetch<{ data: ProjectDetail }>(`/projects/${id}`, token)
    return res.data
}

export async function updateProject(
    token: string,
    id: string,
    payload: { name?: string; description?: string; isPublic?: boolean }
): Promise<Project> {
    const res = await apiFetch<{ data: Project }>(`/projects/${id}`, token, {
        method: 'PUT',
        body: JSON.stringify(payload),
    })
    return res.data
}

export async function deleteProject(token: string, id: string): Promise<void> {
    await apiFetch<void>(`/projects/${id}`, token, { method: 'DELETE' })
}

export async function getProjectStats(token: string, id: string): Promise<ProjectStats> {
    const res = await apiFetch<{ data: ProjectStats }>(`/projects/${id}/stats`, token)
    return res.data
}

export async function duplicateProject(token: string, id: string): Promise<Project> {
    const res = await apiFetch<{ data: Project }>(`/projects/${id}/duplicate`, token, {
        method: 'POST',
    })
    return res.data
}

// ─── Mocks ────────────────────────────────────────────────────────────────

export async function getMocks(token: string, projectId: string): Promise<Mock[]> {
    const res = await apiFetch<{ data: Mock[] }>(`/projects/${projectId}/mocks`, token)
    return res.data
}

export async function createMock(
    token: string,
    projectId: string,
    payload: {
        name: string
        path: string
        method: string
        description?: string
        responseType?: string
        responseDelay?: number
    }
): Promise<Mock> {
    const res = await apiFetch<{ data: Mock }>(`/projects/${projectId}/mocks`, token, {
        method: 'POST',
        body: JSON.stringify(payload),
    })
    return res.data
}

export async function getMock(token: string, mockId: string): Promise<MockDetail> {
    const res = await apiFetch<{ data: MockDetail }>(`/mocks/${mockId}`, token)
    return res.data
}

export async function updateMock(
    token: string,
    mockId: string,
    payload: {
        name?: string
        path?: string
        method?: string
        description?: string
        responseType?: string
        responseDelay?: number
        isActive?: boolean
    }
): Promise<Mock> {
    const res = await apiFetch<{ data: Mock }>(`/mocks/${mockId}`, token, {
        method: 'PUT',
        body: JSON.stringify(payload),
    })
    return res.data
}

export async function deleteMock(token: string, mockId: string): Promise<void> {
    await apiFetch<void>(`/mocks/${mockId}`, token, { method: 'DELETE' })
}

export async function duplicateMock(token: string, mockId: string): Promise<Mock> {
    const res = await apiFetch<{ data: Mock }>(`/mocks/${mockId}/duplicate`, token, {
        method: 'POST',
    })
    return res.data
}

// ─── Mock Responses ───────────────────────────────────────────────────────

export async function getMockResponses(token: string, mockId: string): Promise<MockResponse[]> {
    const res = await apiFetch<{ data: MockResponse[] }>(`/mocks/${mockId}/responses`, token)
    return res.data
}

export async function createMockResponse(
    token: string,
    mockId: string,
    payload: {
        name?: string
        statusCode?: number
        headers?: Record<string, string>
        body?: string
        isDefault?: boolean
        weight?: number
        conditions?: Condition[]
    }
): Promise<MockResponse> {
    const res = await apiFetch<{ data: MockResponse }>(`/mocks/${mockId}/responses`, token, {
        method: 'POST',
        body: JSON.stringify(payload),
    })
    return res.data
}

export async function updateMockResponse(
    token: string,
    mockId: string,
    responseId: string,
    payload: {
        name?: string
        statusCode?: number
        headers?: Record<string, string>
        body?: string
        isDefault?: boolean
        weight?: number
        conditions?: Condition[]
    }
): Promise<MockResponse> {
    const res = await apiFetch<{ data: MockResponse }>(
        `/mocks/${mockId}/responses/${responseId}`,
        token,
        { method: 'PUT', body: JSON.stringify(payload) }
    )
    return res.data
}

export async function deleteMockResponse(
    token: string,
    mockId: string,
    responseId: string
): Promise<void> {
    await apiFetch<void>(`/mocks/${mockId}/responses/${responseId}`, token, { method: 'DELETE' })
}

// ─── Request Logs ─────────────────────────────────────────────────────────

export async function getMockRequestLogs(
    token: string,
    mockId: string,
    opts?: { page?: number; limit?: number; startDate?: string; endDate?: string }
): Promise<RequestLogsResponse> {
    const params = new URLSearchParams()
    if (opts?.page) params.set('page', String(opts.page))
    if (opts?.limit) params.set('limit', String(opts.limit))
    if (opts?.startDate) params.set('startDate', opts.startDate)
    if (opts?.endDate) params.set('endDate', opts.endDate)
    const qs = params.toString()
    return apiFetch<RequestLogsResponse>(`/mocks/${mockId}/request-logs${qs ? `?${qs}` : ''}`, token)
}

// ─── Helpers ──────────────────────────────────────────────────────────────

/** Parse the headers JSON string returned by the API */
export function parseResponseHeaders(headersStr: string): Record<string, string> {
    try { return JSON.parse(headersStr) } catch { return {} }
}

/** Parse the conditions JSON string returned by the API */
export function parseConditions(conditionsStr: string | undefined | null): Condition[] {
    if (!conditionsStr) return []
    try { return JSON.parse(conditionsStr) } catch { return [] }
}

/** Build the public mock execution URL */
export function getMockUrl(projectSlug: string, mockPath: string): string {
    return `${BASE_URL}/m/${projectSlug}${mockPath}`
}
