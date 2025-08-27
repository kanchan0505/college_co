import { AbilityBuilder, createMongoAbility } from '@casl/ability'

export function defineAbilitiesFor(user) {
  const { can, cannot, build } = new AbilityBuilder(createMongoAbility)

  if (user.role === 'admin') {
    // Admin can do everything
    can('manage', 'all')
  } else if (user.role === 'hod') {
    // HOD permissions
    can('read', 'Department', { id: user.department_id })
    can('update', 'Department', { id: user.department_id })
    can('manage', 'Faculty', { department_id: user.department_id })
    can('manage', 'Student', { department_id: user.department_id })
    can('manage', 'Subject', { department_id: user.department_id })
    can('read', 'Marks', { department_id: user.department_id })
    can('manage', 'FacultySubject', { department_id: user.department_id })
  } else if (user.role === 'faculty') {
    // Faculty permissions
    can('read', 'Subject', { faculty_id: user.id })
    can('manage', 'Marks', { faculty_id: user.id })
    can('read', 'Student', { department_id: user.department_id })
    can('read', 'Unit')
  }

  return build()
}

export function checkPermission(ability, action, subject, field) {
  return ability.can(action, subject, field)
}
