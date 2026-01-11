'use client';

import { useUser } from '@stackframe/stack';
import { useState, useEffect, useRef } from 'react';
import { Loader2, User as UserIcon, Camera, Mail, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export function MyProfile() {
    const user = useUser();
    const [displayName, setDisplayName] = useState('');
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user) {
            setDisplayName(user.displayName || '');
        }
    }, [user]);

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
                if (!user) return;
                await user.update({ profileImageUrl: base64String });
                setUploading(false);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Failed to upload image:', error);
            setUploading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setSaving(true);
        setSuccess(false);
        try {
            await user.update({ displayName });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error('Failed to update profile', error);
        } finally {
            setSaving(false);
        }
    };

    if (!user) return (
        <div className="space-y-6 animate-pulse p-4">
            <div className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl mb-8"></div>
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
            <div className="space-y-4">
                <div className="h-12 bg-slate-50 dark:bg-slate-900 rounded"></div>
                <div className="h-12 bg-slate-50 dark:bg-slate-900 rounded"></div>
            </div>
        </div>
    );

    return (
        <div className="max-w-2xl space-y-8">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Public Profile</h2>
                <p className="text-sm text-muted-foreground mt-1">
                    This is how you will appear to other members of your team.
                </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-8 items-start">

                    {/* Avatar Section */}
                    <div className="flex flex-col items-center space-y-3 shrink-0 mx-auto sm:mx-0">
                        <div
                            className="w-28 h-28 rounded-full bg-muted border-4 border-card shadow-md flex items-center justify-center overflow-hidden relative group cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {user.profileImageUrl ? (
                                <Image
                                    src={user.profileImageUrl}
                                    alt={user.displayName || 'User'}
                                    className="object-cover"
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                                    <UserIcon className="w-12 h-12" />
                                </div>
                            )}
                            {/* Overlay for "Change" */}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                {uploading ? (
                                    <Loader2 className="w-6 h-6 text-white/80 animate-spin" />
                                ) : (
                                    <Camera className="w-6 h-6 text-white/80" />
                                )}
                            </div>
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                        >
                            Change Avatar
                        </button>
                    </div>

                    {/* Form Section */}
                    <form onSubmit={handleSave} className="flex-1 space-y-6 w-full">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                Display Name
                            </label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="flex h-11 w-full rounded-lg border border-border bg-transparent px-4 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all text-foreground"
                                placeholder="e.g. Jane Doe"
                            />
                            <p className="text-[11px] text-muted-foreground">
                                Please use your real name or a nickname you&apos;re comfortable with.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="email"
                                    value={user.primaryEmail || ''}
                                    disabled
                                    className="flex h-11 w-full pl-10 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground disabled:cursor-not-allowed"
                                />
                            </div>
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                                Managed via <Link href="/account-settings/advanced" className="text-indigo-500 hover:underline">Advanced Settings</Link>.
                            </p>
                        </div>

                        <div className="pt-2 flex items-center gap-4">
                            <button
                                type="submit"
                                disabled={saving || !displayName || displayName === user.displayName}
                                className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-indigo-600 text-white hover:bg-indigo-700 h-10 px-6 shadow-sm hover:shadow-md disabled:shadow-none"
                            >
                                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {success ? <CheckCircle2 className="mr-2 h-4 w-4" /> : null}
                                {success ? 'Saved' : 'Save Changes'}
                            </button>

                            {success && <span className="text-sm text-emerald-600 animate-in fade-in slide-in-from-left-2">Profile updated!</span>}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
