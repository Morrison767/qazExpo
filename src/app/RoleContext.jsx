import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { getRole } from '@/design/roles'

/**
 * Демо-режим прототипа: активная роль хранится в контексте и переключается
 * из топбара («Войти как: …»). От роли зависит состав навигации и — на
 * следующих шагах — видимость финансовых, юридических и охранных блоков.
 */
const RoleContext = createContext(null)

export function RoleProvider({ children, initialRole = 'manager' }) {
  const [roleKey, setRoleKey] = useState(initialRole)

  const value = useMemo(
    () => ({
      roleKey,
      role: getRole(roleKey),
      setRole: setRoleKey,
      isTenant: roleKey === 'tenant',
    }),
    [roleKey],
  )

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>
}

export function useRole() {
  const context = useContext(RoleContext)
  if (!context) throw new Error('useRole должен вызываться внутри <RoleProvider>')
  return context
}

/** Проверка доступа: can(['finance', 'head']) */
export function useCan() {
  const { roleKey } = useRole()
  return useCallback((roles) => roles === 'all' || roles.includes(roleKey), [roleKey])
}
