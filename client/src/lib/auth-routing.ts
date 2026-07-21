import type { User } from "@shared/schema";

export function getDashboardPath(role: User["role"]): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "teacher":
      return "/dashboard/professeur";
    case "parent":
      return "/dashboard/parent";
    case "student":
      return "/dashboard/eleve";
    default:
      return "/";
  }
}

export function getAuthenticatedRedirectPath(
  user: Pick<User, "role" | "mustChangePassword">,
  currentPath: string
): string | null {
  const path = currentPath.split("?")[0] || "/";
  const dashboardPath = getDashboardPath(user.role);

  if (user.mustChangePassword && path !== "/changer-mot-de-passe") {
    return "/changer-mot-de-passe";
  }

  if (
    path === "/changer-mot-de-passe" ||
    path === "/messages" ||
    path === "/parametres" ||
    path === "/notifications" ||
    path === "/trouver-professeur" ||
    path.startsWith("/professeurs/")
  ) {
    return null;
  }

  if (path === dashboardPath) {
    return null;
  }

  if (path === "/" || path.startsWith("/dashboard") || path.startsWith("/admin")) {
    return dashboardPath;
  }

  return dashboardPath;
}
