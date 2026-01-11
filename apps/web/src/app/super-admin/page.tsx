import { requireSuperAdmin } from "@/actions/auth";
import { prisma } from "@/lib/db";
import { Shield, Building2, Users } from "lucide-react";

import { redirect } from 'next/navigation';

export default async function SuperAdminDashboard() {
    try {
        await requireSuperAdmin();
    } catch {
        redirect('/');
    }

    const organizations = await prisma.organization.findMany({
        include: {
            _count: { select: { members: true, projects: true } },
            members: {
                where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
                include: {
                    user: {
                        select: { name: true, email: true }
                    }
                }
            }
        },
        orderBy: { createdAt: 'desc' },
        take: 50 // Limit to latest 50 for performance
    });

    return (
        <div className="p-8 space-y-8 max-w-6xl mx-auto">
            <div className="flex items-center gap-3 border-b pb-6">
                <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                    <Shield className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">Platform Super Admin</h1>
                    <p className="text-muted-foreground">Global oversight of all organizations and their admins.</p>
                </div>
            </div>

            {/* Organizations Table */}
            <div className="bg-white dark:bg-slate-900 border rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/10">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-indigo-500" />
                        Organizations ({organizations.length})
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">Organization Name</th>
                                <th className="px-6 py-4">Organization Admin(s)</th>
                                <th className="px-6 py-4 text-center">Stats</th>
                                <th className="px-6 py-4 text-right">Tenant ID</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {organizations.map(org => (
                                <tr key={org.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-base text-foreground">{org.name}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        {org.members.length > 0 ? (
                                            <div className="space-y-1">
                                                {org.members.map((member, i) => (
                                                    <div key={i} className="flex items-center gap-2">
                                                        <Users className="w-3 h-3 text-indigo-500" />
                                                        <span className="font-medium text-slate-700 dark:text-slate-300">
                                                            {member.user.name || 'Unnamed'}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            ({member.user.email})
                                                        </span>
                                                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 rounded text-slate-500">
                                                            {member.role}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground italic text-xs">No specific Admin found</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center gap-4">
                                            <div className="text-center">
                                                <div className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                                                    {org._count.members}
                                                </div>
                                                <div className="text-[10px] uppercase text-slate-500 font-bold">Users</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                                                    {org._count.projects}
                                                </div>
                                                <div className="text-[10px] uppercase text-slate-500 font-bold">Projects</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs select-all">
                                            {org.id}
                                        </code>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
