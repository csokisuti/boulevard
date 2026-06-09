export const PERMISSION_GROUPS = [
  {
    title: "Standolás",
    items: [
      ["canViewStand", "Stand oldal megnyitása"],
      ["canOpenShift", "Új stand nyitása"],
      ["canSaveShift", "Nyitott stand mentése"],
      ["canCloseShift", "Stand lezárása"],
      ["canModifyClosedShift", "Lezárt stand utólagos módosítása"],
      ["canApplyProductUpdatesToShift", "Terméklista-frissítés alkalmazása nyitott standra"]
    ]
  },
  {
    title: "Stand tételsorok",
    items: [
      ["canEditOpeningStock", "Nyitó készlet módosítása"],
      ["canEditReceivedStock", "Vételezés módosítása"],
      ["canEditSalePriceInShift", "Egységár módosítása stand közben"],
      ["canCreateProductFromStand", "Új termék felvitele standból"]
    ]
  },
  {
    title: "Pénzügyek",
    items: [
      ["canManageMoneyMovements", "Egyéb pénzmozgás rögzítése"],
      ["canAddCardPayment", "Bankkártya összeg rögzítése"],
      ["canAddLottoTurnover", "Lottó forgalom rögzítése"],
      ["canAddRepi", "Repi rögzítése"],
      ["canViewDebts", "Tartozások megtekintése"],
      ["canCreateDebt", "Új tartozás felírása"],
      ["canPayDebt", "Tartozás befizetés rögzítése"],
      ["canEditTodayDebt", "Aznapi tartozás javítása"],
      ["canDeleteTodayDebt", "Aznapi tartozás törlése"]
    ]
  },
  {
    title: "Termékek",
    items: [
      ["canViewProducts", "Terméklista megtekintése"],
      ["canCreateProducts", "Új termék létrehozása"],
      ["canEditProducts", "Termékadatok módosítása"],
      ["canChangeProductStatus", "Termék aktív/passzív állítás"],
      ["canDeleteProducts", "Termék törlése"],
      ["canManageCategories", "Kategóriák kezelése"],
      ["canReorderProducts", "Kategória- és terméksorrend módosítása"],
      ["canReviewProducts", "Dolgozói termékmódosítás ellenőrzése"],
      ["canViewPurchasePrice", "Beszerzési ár megtekintése"],
      ["canEditPurchasePrice", "Beszerzési ár módosítása"]
    ]
  },
  {
    title: "Admin és riport",
    items: [
      ["canViewClosedShifts", "Lezárt standok listája"],
      ["canViewLogs", "Admin ellenőrzések / naplók"],
      ["canViewReports", "Riportok megtekintése"],
      ["canManageUsers", "Felhasználók és jogosultságok kezelése"]
    ]
  }
];

export const PERMISSION_LABELS = Object.fromEntries(
  PERMISSION_GROUPS.flatMap(group => group.items)
);

export const DEFAULT_ROLE_PERMISSIONS = {
  admin: Object.fromEntries(Object.keys(PERMISSION_LABELS).map(key => [key, true])),
  dolgozo: {
    canViewStand: true,
    canOpenShift: true,
    canSaveShift: true,
    canCloseShift: true,
    canModifyClosedShift: false,
    canApplyProductUpdatesToShift: false,
    canEditOpeningStock: true,
    canEditReceivedStock: true,
    canEditSalePriceInShift: false,
    canCreateProductFromStand: true,
    canManageMoneyMovements: true,
    canAddCardPayment: true,
    canAddLottoTurnover: true,
    canAddRepi: true,
    canViewDebts: true,
    canCreateDebt: true,
    canPayDebt: true,
    canEditTodayDebt: true,
    canDeleteTodayDebt: true,
    canViewProducts: true,
    canCreateProducts: false,
    canEditProducts: false,
    canChangeProductStatus: false,
    canDeleteProducts: false,
    canManageCategories: false,
    canReorderProducts: false,
    canReviewProducts: false,
    canViewPurchasePrice: false,
    canEditPurchasePrice: false,
    canViewClosedShifts: true,
    canViewLogs: false,
    canViewReports: false,
    canManageUsers: false
  }
};

export function roleKey(role) {
  return role === "admin" ? "admin" : "dolgozo";
}

export function roleLabel(role) {
  return role === "admin" ? "Admin" : "Dolgozó";
}

export function normalizePermissions(userData = {}) {
  const base = DEFAULT_ROLE_PERMISSIONS[roleKey(userData.role)] || DEFAULT_ROLE_PERMISSIONS.dolgozo;
  return {
    ...base,
    ...(userData.permissions || {})
  };
}

export function hasPermission(userData, permission) {
  if (!userData || userData.active === false) return false;
  if (userData.role === "admin") return true;
  const permissions = normalizePermissions(userData);
  return permissions[permission] === true;
}

export function hasAnyPermission(userData, permissions) {
  return permissions.some(permission => hasPermission(userData, permission));
}

export function permissionLabel(permission) {
  return PERMISSION_LABELS[permission] || permission;
}
