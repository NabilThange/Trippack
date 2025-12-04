export interface Profile {
  id: string
  username: string
  created_at: string
  updated_at: string
}

export interface Trip {
  id: string
  name: string
  description: string | null
  owner_id: string
  invite_code: string
  is_public: boolean
  destination: string | null
  start_date: string | null
  end_date: string | null
  created_at: string
  updated_at: string
  owner?: Profile
  auto_approve_members?: boolean
}

export interface TripMember {
  id: string
  trip_id: string
  user_id: string
  status: "pending" | "approved" | "rejected"
  joined_at: string
  user?: Profile
}

export interface Folder {
  id: string
  trip_id: string
  name: string
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  trip_id: string
  folder_id?: string | null
  text: string
  description: string | null
  deadline: string | null
  packed: boolean
  packed_by_id: string | null
  packed_by_name: string | null
  creator_id: string
  creator_name: string
  created_at: string
  updated_at: string
  packers?: TaskPacker[]
}

export interface TaskPacker {
  id: string
  task_id: string
  user_id: string
  user_name: string
  packed_at: string
}

export interface TripWithDetails extends Trip {
  owner: Profile
  member_count: number
  task_count: number
  is_member: boolean
  membership_status: "owner" | "approved" | "pending" | "none"
}
