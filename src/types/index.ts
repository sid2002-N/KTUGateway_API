export interface GradeRow {
  slot: string
  course: string
  credit: string
  type: string
  completed: string
  grade: string
  earned: string
}

export interface StudentData {
  username: string
  userid: string
  proimg: string
  Gender?: string
  DateofAdmission?: string
  Programme?: string
  Branch?: string
  Batch?: string
  SchemeofStudy?: string
  S1: GradeRow[]
  S1sgpa: string
  S2: GradeRow[]
  S2sgpa: string
  S3: GradeRow[]
  S3sgpa: string
  S4: GradeRow[]
  S4sgpa: string
  S5: GradeRow[]
  S5sgpa: string
  S6: GradeRow[]
  S6sgpa: string
  S7: GradeRow[]
  S7sgpa: string
  S8: GradeRow[]
  S8sgpa: string
  activityPoints: Record<string, string>
  [key: string]: unknown
}

export interface KTUNotification {
  date: string
  heading: string
  key: string
  data: string
}

export interface User {
  id: string
  password: string
}
