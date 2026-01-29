// ============================================
// TIPOS PARA MEMBRESÍAS GRUPALES
// ============================================

export interface Member {
  id: string;
  code: string;
  name: string;
  phone?: string;
  email?: string;
  photo_url?: string;
  is_active: boolean;
  activeMembership?: {
    discipline: { name: string };
    end_date: string;
  };
}

export interface Discipline {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
}

export interface PricingPlan {
  id: string;
  discipline_id: string;
  num_people: number;
  num_months: number;
  price: number;
}

export interface MembershipMember {
  id: string;
  member_id: string;
  price_applied: number;
  is_primary: boolean;
  created_at: string;
  member: {
    id: string;
    code: string;
    name: string;
    phone?: string;
    email?: string;
    photo_url?: string;
  };
}

export interface Membership {
  id: string;
  gym_id: string;
  discipline_id: string;
  pricing_plan_id?: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  start_date: string;
  end_date: string;
  total_amount?: number;
  payment_method?: string;
  notes?: string;
  created_at: string;
  updated_at: string;

  // Relaciones
  discipline: Discipline;
  pricingPlan?: PricingPlan;
  membershipMembers: MembershipMember[];

  // Compatibilidad con estructura antigua
  member?: {
    id: string;
    code: string;
    name: string;
    phone?: string;
  };
  member_id?: string;
  amount_paid?: number;
}

// ============================================
// INTERFACES PARA FORMULARIOS
// ============================================

export interface MemberInput {
  memberId: string;
  isPrimary: boolean;
}

export interface CreateGroupMembershipPayload {
  disciplineId: string;
  pricingPlanId: string;
  members: MemberInput[];
  paymentMethod?: string;
  notes?: string;
}

export interface RenewGroupMembershipPayload {
  memberIds: string[];
  pricingPlanId: string;
  paymentMethod?: string;
  notes?: string;
}

export interface CreateMembershipPayload {
  member_id: string;
  discipline_id: string;
  start_date: string;
  end_date: string;
  amount_paid: number;
  payment_method?: string;
  notes?: string;
}

export interface MembershipStats {
  total: number;
  active: number;
  expired: number;
  expiringSoon: number;
}

// ============================================
// TIPOS DE UTILIDAD
// ============================================

export type PaymentMethod = 'qr' | 'efectivo' | 'transferencia';

export interface MemberSelectionItem extends Member {
  selected: boolean;
  isPrimary: boolean;
}
