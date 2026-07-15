export const ADMIN_COMPLIANCE_REQUIRED_CODE = 'ADMIN_COMPLIANCE_ACK_REQUIRED'
export const ADMIN_COMPLIANCE_REQUIRED_EVENT = 'admin-compliance-required'

export function isAdminComplianceRequiredError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false
  }

  const candidate = error as { status?: unknown; code?: unknown; response?: { status?: unknown; data?: { code?: unknown } } }
  return (
    candidate.code === ADMIN_COMPLIANCE_REQUIRED_CODE ||
    candidate.response?.data?.code === ADMIN_COMPLIANCE_REQUIRED_CODE ||
    candidate.status === 423 ||
    candidate.response?.status === 423
  )
}
