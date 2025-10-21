/**
 * Permission definitions and role-based access control
 */

// All available permissions
export const PERMISSIONS = {
  // Order permissions
  ADD_ORDER: 'addOrder',
  EDIT_ORDER: 'editOrder',
  REMOVE_ORDER: 'removeOrder',
  
  // Mandobe permissions
  SHOW_MANDOBE: 'showMandobe',
  ADD_MANDOBE: 'addMandobe',
  EDIT_MANDOBE: 'editMandobe',
  REMOVE_MANDOBE: 'removeMandobe',
  
  // Code/Product permissions
  SHOW_CODE: 'showCode',
  ADD_CODE: 'addCode',
  EDIT_CODE: 'editCode',
  REMOVE_CODE: 'removeCode',
  
  // Store/Supplier permissions
  SHOW_STORE: 'showStore',
  ADD_STORE: 'addStore',
  EDIT_STORE: 'editStore'
};

// Default permissions for each role
export const ROLE_PERMISSIONS = {
  admin: {
    addOrder: true,
    editOrder: true,
    removeOrder: true,
    showMandobe: true,
    addMandobe: true,
    editMandobe: true,
    removeMandobe: true,
    showCode: true,
    addCode: true,
    editCode: true,
    removeCode: true,
    showStore: true,
    addStore: true,
    editStore: true
  },
  
  sales: { // مستخدم عادي
    addOrder: true,
    editOrder: true,
    removeOrder: true,
    showMandobe: true,
    addMandobe: false,
    editMandobe: false,
    removeMandobe: false,
    showCode: true,
    addCode: false,
    editCode: false,
    removeCode: false,
    showStore: true,
    addStore: false,
    editStore: false
  },
  
  marketer: { // مسوق
    addOrder: true,
    editOrder: false,
    removeOrder: false,
    showMandobe: false,
    addMandobe: false,
    editMandobe: false,
    removeMandobe: false,
    showCode: false,
    addCode: false,
    editCode: false,
    removeCode: false,
    showStore: false,
    addStore: false,
    editStore: false
  },
  
  mandobe: { // مندوب
    addOrder: false,
    editOrder: false,
    removeOrder: false,
    showMandobe: false,
    addMandobe: false,
    editMandobe: false,
    removeMandobe: false,
    showCode: false,
    addCode: false,
    editCode: false,
    removeCode: false,
    showStore: false,
    addStore: false,
    editStore: false
  }
};

/**
 * Get permissions for a role
 * @param {string} role - User role
 * @returns {object} Permissions object
 */
export function getPermissionsForRole(role) {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.marketer;
}

/**
 * Merge custom permissions with role defaults
 * @param {string} role - User role
 * @param {object} customPermissions - Custom permissions to override
 * @returns {object} Merged permissions
 */
export function mergePermissions(role, customPermissions = {}) {
  const defaultPermissions = getPermissionsForRole(role);
  return {
    ...defaultPermissions,
    ...customPermissions
  };
}

/**
 * Check if user has specific permission
 * @param {object} userPermissions - User's permissions object
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
export function hasPermission(userPermissions, permission) {
  return userPermissions?.[permission] === true;
}

/**
 * Check if user has any of the specified permissions
 * @param {object} userPermissions - User's permissions object
 * @param {string[]} permissions - Array of permissions to check
 * @returns {boolean}
 */
export function hasAnyPermission(userPermissions, permissions) {
  return permissions.some(permission => hasPermission(userPermissions, permission));
}

/**
 * Check if user has all of the specified permissions
 * @param {object} userPermissions - User's permissions object
 * @param {string[]} permissions - Array of permissions to check
 * @returns {boolean}
 */
export function hasAllPermissions(userPermissions, permissions) {
  return permissions.every(permission => hasPermission(userPermissions, permission));
}

/**
 * Get Arabic role name
 * @param {string} role - Role key
 * @returns {string} Arabic role name
 */
export function getRoleNameArabic(role) {
  const roleNames = {
    admin: 'ادمن',
    sales: 'مستخدم عادي',
    marketer: 'مسوق',
    mandobe: 'مندوب'
  };
  return roleNames[role] || role;
}

/**
 * Get role from Arabic name
 * @param {string} arabicName - Arabic role name
 * @returns {string} Role key
 */
export function getRoleFromArabic(arabicName) {
  const roleMap = {
    'ادمن': 'admin',
    'مستخدم عادي': 'sales',
    'مسوق': 'marketer',
    'مندوب': 'mandobe'
  };
  return roleMap[arabicName] || 'marketer';
}
