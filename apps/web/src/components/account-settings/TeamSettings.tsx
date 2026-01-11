'use client';

import { useState, useRef } from 'react';
import {
    Settings,
    Upload,
    MoreVertical,
    Loader2
} from 'lucide-react';
import { useUser } from '@stackframe/stack';
import Image from 'next/image';

interface TeamSettingsProps {
    teamId: string;
}

export function TeamSettings({ teamId }: TeamSettingsProps) {
    const user = useUser();
    const team = user?.useTeams().find(t => t.id === teamId);
    const users = team?.useUsers() || [];
    const invitations = team?.useInvitations() || [];

    const [inviteEmail, setInviteEmail] = useState('');
    const [isInviting, setIsInviting] = useState(false);
    const [displayName, setDisplayName] = useState(team?.displayName || '');
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    // const [teamUserName, setTeamUserName] = useState(''); // Need to find my profile in team

    if (!team) return <div>Team not found</div>;

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 1024 * 1024) {
            alert("File size must be less than 1MB");
            return;
        }

        setUploading(true);
        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64String = reader.result as string;
                await team.update({ profileImageUrl: base64String });
                setUploading(false);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Failed to upload image:', error);
            setUploading(false);
        }
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail) return;
        setIsInviting(true);
        try {
            await team.inviteUser({ email: inviteEmail });
            setInviteEmail('');
        } catch (error) {
            console.error('Failed to invite:', error);
        } finally {
            setIsInviting(false);
        }
    };

    const handleUpdateTeamName = async () => {
        if (displayName === team.displayName) return;
        try {
            await team.update({ displayName });
        } catch (error) {
            console.error('Failed to update team name:', error);
        }
    };

    return (
        <div className="space-y-10 max-w-4xl animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center text-white text-lg font-bold">
                        {team.displayName.charAt(0).toUpperCase()}
                    </div>
                    {team.displayName}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Manage your team settings and members.
                </p>
            </div>

            {/* Team User Name (My Profile in Team) */}
            <section className="space-y-4">
                <div className="grid gap-1">
                    <h3 className="text-base font-semibold text-foreground">Team user name</h3>
                    <p className="text-sm text-muted-foreground">Overwrite your user display name in this team</p>
                </div>
                <div className="flex gap-4 items-center max-w-xl">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder={user?.displayName || "Your Name"}
                            className="w-full px-3 py-2 bg-transparent border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-foreground placeholder:text-muted-foreground"
                            defaultValue={user?.displayName || ''}
                        // Need to bind to team profile update
                        />
                        <Settings className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    </div>
                </div>
            </section>

            <hr className="border-slate-200 dark:border-slate-800" />

            {/* Team Profile Image */}
            <section className="space-y-4">
                <div className="grid gap-1">
                    <h3 className="text-base font-semibold text-foreground">Team profile image</h3>
                    <p className="text-sm text-muted-foreground">Upload an image for your team</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-xl font-bold border border-slate-200 dark:border-slate-700 overflow-hidden relative">
                        {team.profileImageUrl ? (
                            <Image
                                src={team.profileImageUrl}
                                alt={team.displayName}
                                className="object-cover"
                                fill
                                sizes="64px"
                            />
                        ) : (
                            team.displayName.slice(0, 2).toUpperCase()
                        )}
                    </div>

                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                    />

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-2 text-foreground"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload className="w-4 h-4" />
                                Upload Image
                            </>
                        )}
                    </button>
                </div>
            </section>

            <hr className="border-slate-200 dark:border-slate-800" />

            {/* Team Display Name */}
            <section className="space-y-4">
                <div className="grid gap-1">
                    <h3 className="text-base font-semibold text-foreground">Team display name</h3>
                    <p className="text-sm text-muted-foreground">Change the display name of your team</p>
                </div>
                <div className="flex gap-4 items-center max-w-xl">
                    <div className="flex-1">
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            onBlur={handleUpdateTeamName}
                            className="w-full px-3 py-2 bg-transparent border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-foreground"
                        />
                    </div>
                </div>
            </section>

            <hr className="border-slate-200 dark:border-slate-800" />

            {/* Members */}
            <section className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Members</h3>
                <div className="bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 dark:bg-slate-900/50 text-muted-foreground border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-3 font-medium text-muted-foreground">User</th>
                                    <th className="px-6 py-3 font-medium text-muted-foreground">Name</th>
                                    <th className="px-6 py-3 font-medium text-right text-muted-foreground">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {users.map((member) => (
                                    <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-medium text-xs">
                                                    {member.teamProfile?.displayName?.[0] || member.id.slice(0, 2)}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-foreground font-medium">
                                            {member.teamProfile?.displayName ||
                                                <span className="text-muted-foreground italic">No name set</span>}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-muted-foreground hover:text-red-500 transition-colors">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            <hr className="border-slate-200 dark:border-slate-800" />

            {/* Invite Member */}
            <section className="space-y-4">
                <div className="grid gap-1">
                    <h3 className="text-base font-semibold text-foreground">Invite member</h3>
                    <p className="text-sm text-muted-foreground">Invite a user to your team through email</p>
                </div>
                <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3 max-w-xl">
                    <input
                        type="email"
                        placeholder="Email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="flex-1 px-3 py-2 bg-transparent border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-foreground placeholder:text-muted-foreground"
                        required
                    />
                    <button
                        type="submit"
                        disabled={isInviting}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                        {isInviting ? 'Inviting...' : 'Invite User'}
                    </button>
                </form>
            </section>

            {/* Outstanding Invitations */}
            {invitations.length > 0 && (
                <section className="space-y-4 pt-4">
                    <h3 className="text-base font-semibold text-foreground">Outstanding invitations</h3>
                    <div className="bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 dark:bg-slate-900/50 text-muted-foreground border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-3 font-medium text-muted-foreground">Email</th>
                                    <th className="px-6 py-3 font-medium text-right text-muted-foreground">Expires</th>
                                    <th className="px-6 py-3 font-medium text-right text-muted-foreground">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {invitations.map((inv) => (
                                    <tr key={inv.id}>
                                        <td className="px-6 py-4 text-foreground">{inv.recipientEmail}</td>
                                        <td className="px-6 py-4 text-right text-muted-foreground">{new Date(inv.expiresAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => inv.revoke()}
                                                className="text-red-500 hover:text-red-600 text-xs font-medium px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                                            >
                                                Revoke
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            <hr className="border-slate-200 dark:border-slate-800" />

            {/* Leave Team */}
            <section className="space-y-4 pt-2">
                <h3 className="text-lg font-semibold text-foreground">Leave Team</h3>
                <div className="bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h4 className="font-medium text-foreground flex items-center gap-2">
                            Leave Team
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1 max-w-md">
                            leave this team and remove your team profile
                        </p>
                    </div>
                    <button className="px-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm whitespace-nowrap">
                        Leave team
                    </button>
                </div>
            </section>
        </div>
    );
}
