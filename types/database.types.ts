export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          email_verified: boolean
          password_hash: string | null
          name: string
          nickname: string | null
          avatar_url: string | null
          status: 'pending' | 'active' | 'suspended' | 'cancelled'
          role: 'member' | 'admin' | 'super_admin'
          last_login_at: string | null
          deleted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          email_verified?: boolean
          password_hash?: string | null
          name: string
          nickname?: string | null
          avatar_url?: string | null
          status?: 'pending' | 'active' | 'suspended' | 'cancelled'
          role?: 'member' | 'admin' | 'super_admin'
          last_login_at?: string | null
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          email_verified?: boolean
          password_hash?: string | null
          name?: string
          nickname?: string | null
          avatar_url?: string | null
          status?: 'pending' | 'active' | 'suspended' | 'cancelled'
          role?: 'member' | 'admin' | 'super_admin'
          last_login_at?: string | null
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      plans: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          billing_interval: string
          stripe_price_id: string | null
          features: Json | null
          is_active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
      }
      // Add other tables as needed
    }
  }
}
