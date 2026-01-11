import { requireAdmin } from "@/actions/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    try {
        await requireAdmin();
    } catch {
        // If unauthorized, redirect to home or my-tasks
        redirect('/my-tasks');
    }

    return (
        <>
            {children}
        </>
    );
}
