import axios from 'axios';
import { TOKEN_KEY, API_URL } from '../constants/auth';
import type {
  Membership,
  CreateGroupMembershipPayload,
  RenewGroupMembershipPayload,
  CreateMembershipPayload,
  MembershipStats,
} from '../types/membership';

// ============================================
// HELPER PARA OBTENER TOKEN
// ============================================

const getAuthHeader = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  return { Authorization: `Bearer ${token}` };
};

// ============================================
// ENDPOINTS DE MEMBRESÍAS
// ============================================

/**
 * Obtener todas las membresías
 */
export const getAllMemberships = async (): Promise<Membership[]> => {
  const response = await axios.get(`${API_URL}/memberships`, {
    headers: getAuthHeader(),
  });
  return response.data.data;
};

/**
 * Obtener membresía por ID
 */
export const getMembershipById = async (id: string): Promise<Membership> => {
  const response = await axios.get(`${API_URL}/memberships/${id}`, {
    headers: getAuthHeader(),
  });
  return response.data.data;
};

/**
 * Obtener membresías de un miembro
 */
export const getMembershipsByMember = async (memberId: string): Promise<Membership[]> => {
  const response = await axios.get(`${API_URL}/memberships/member/${memberId}`, {
    headers: getAuthHeader(),
  });
  return response.data.data;
};

/**
 * Obtener membresía activa de un miembro
 */
export const getActiveMembershipByMember = async (
  memberId: string
): Promise<Membership | null> => {
  try {
    const response = await axios.get(`${API_URL}/memberships/member/${memberId}/active`, {
      headers: getAuthHeader(),
    });
    return response.data.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

/**
 * Obtener membresías por vencer
 */
export const getExpiringMemberships = async (): Promise<Membership[]> => {
  const response = await axios.get(`${API_URL}/memberships/expiring`, {
    headers: getAuthHeader(),
  });
  return response.data.data;
};

/**
 * Obtener estadísticas de membresías
 */
export const getMembershipStats = async (): Promise<MembershipStats> => {
  const response = await axios.get(`${API_URL}/memberships/stats`, {
    headers: getAuthHeader(),
  });
  return response.data.data;
};

// ============================================
// CREAR MEMBRESÍAS
// ============================================

/**
 * Crear membresía individual (compatibilidad)
 */
export const createMembership = async (
  payload: CreateMembershipPayload
): Promise<Membership> => {
  const response = await axios.post(`${API_URL}/memberships`, payload, {
    headers: getAuthHeader(),
  });
  return response.data.data;
};

/**
 * Crear membresía grupal
 */
export const createGroupMembership = async (
  payload: CreateGroupMembershipPayload
): Promise<Membership> => {
  const response = await axios.post(`${API_URL}/memberships/group`, payload, {
    headers: getAuthHeader(),
  });
  return response.data.data;
};

// ============================================
// RENOVAR MEMBRESÍAS
// ============================================

/**
 * Renovar membresía simple (compatibilidad)
 */
export const renewMembership = async (
  membershipId: string,
  payload: {
    num_months: number;
    amount_paid: number;
    payment_method?: string;
    notes?: string;
  }
): Promise<Membership> => {
  const response = await axios.post(
    `${API_URL}/memberships/${membershipId}/renew`,
    payload,
    {
      headers: getAuthHeader(),
    }
  );
  return response.data.data;
};

/**
 * Renovar membresía grupal
 */
export const renewGroupMembership = async (
  membershipId: string,
  payload: RenewGroupMembershipPayload
): Promise<Membership> => {
  const response = await axios.post(
    `${API_URL}/memberships/${membershipId}/renew-group`,
    payload,
    {
      headers: getAuthHeader(),
    }
  );
  return response.data.data;
};

// ============================================
// CANCELAR MEMBRESÍA
// ============================================

/**
 * Cancelar membresía
 */
export const cancelMembership = async (
  membershipId: string,
  reason?: string
): Promise<Membership> => {
  const response = await axios.delete(`${API_URL}/memberships/${membershipId}/cancel`, {
    headers: getAuthHeader(),
    data: { reason },
  });
  return response.data.data;
};

// ============================================
// UTILIDADES
// ============================================

/**
 * Calcular fecha de vencimiento
 */
export const calculateEndDate = (startDate: Date, months: number): Date => {
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + months);
  return endDate;
};

/**
 * Verificar si una membresía está activa y vigente
 */
export const isMembershipActive = (membership: Membership): boolean => {
  if (membership.status !== 'ACTIVE') return false;

  const now = new Date();
  const endDate = new Date(membership.end_date);

  return endDate >= now;
};

/**
 * Obtener días restantes de una membresía
 */
export const getDaysRemaining = (membership: Membership): number => {
  const now = new Date();
  const endDate = new Date(membership.end_date);

  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
};

/**
 * Verificar si una membresía está por vencer (próximos 7 días)
 */
export const isExpiringSoon = (membership: Membership, days: number = 7): boolean => {
  const daysRemaining = getDaysRemaining(membership);
  return daysRemaining > 0 && daysRemaining <= days;
};

/**
 * Obtener miembro principal de una membresía
 */
export const getPrimaryMember = (membership: Membership) => {
  return membership.membershipMembers?.find((mm) => mm.is_primary);
};

/**
 * Obtener miembros secundarios de una membresía
 */
export const getSecondaryMembers = (membership: Membership) => {
  return membership.membershipMembers?.filter((mm) => !mm.is_primary) || [];
};

/**
 * Verificar si una membresía es grupal
 */
export const isGroupMembership = (membership: Membership): boolean => {
  return (membership.membershipMembers?.length || 0) > 1;
};

/**
 * Obtener el total de miembros de una membresía
 */
export const getMemberCount = (membership: Membership): number => {
  return membership.membershipMembers?.length || 1;
};

/**
 * Formatear precio
 */
export const formatPrice = (price: number): string => {
  return `Bs ${price.toFixed(2)}`;
};
