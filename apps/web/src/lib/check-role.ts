import { getCurrentUser } from "@/actions/auth";
import { redirect } from "next/navigation";

export async function checkRole(requiredRole: 'ADMIN' | 'STAFF' = 'ADMIN') {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/");
    }

    // Super Admin has access to everything
    if (user.role === 'SUPER_ADMIN') {
        return user;
    }

    if (user.role !== requiredRole && user.role !== 'ADMIN') { // Admin can access everything
        redirect("/");
    }

    return user;
}
