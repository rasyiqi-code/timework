'use client';

import { useUser, useStackApp } from '@stackframe/stack';
import { useState, useEffect } from 'react';
import { Loader2, Mail, Shield, Key, Plus, CheckCircle2, AlertCircle, Smartphone } from 'lucide-react';
import { createTOTPKeyURI, verifyTOTP } from "@oslojs/otp";
import QRCode from "qrcode";

export function EmailsAndAuth() {
    const user = useUser();
    // const oauthProviders = user?.useOAuthProviders?.() || [];
    // const [loading, setLoading] = useState(false);
    const [activeModal, setActiveModal] = useState<'add-email' | 'change-password' | 'mfa' | null>(null);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    if (!user) {
        return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>;
    }

    return (
        <div className="space-y-8 max-w-4xl" onClick={() => setActiveMenu(null)}>
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    <Shield className="w-6 h-6 text-indigo-500" />
                    Emails & Authentication
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Manage your sign-in methods and security preferences.
                </p>
            </div>

            {/* Emails Section */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <Mail className="w-4 h-4 text-indigo-500" />
                        Connected Emails
                    </h3>
                    <button
                        onClick={() => setActiveModal('add-email')}
                        className="text-xs flex items-center gap-1.5 bg-muted hover:bg-muted/80 text-muted-foreground px-3 py-1.5 rounded-lg transition-colors font-medium"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Add Email
                    </button>
                </div>

                <div className="space-y-3">
                    {/* Primary Email */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border relative">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-card rounded-full text-muted-foreground">
                                <Mail className="w-4 h-4" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-foreground">{user.primaryEmail}</span>
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 uppercase tracking-wide">
                                        Primary
                                    </span>
                                </div>
                                <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                    Verified
                                </div>
                            </div>
                        </div>

                        {/* Context Menu Trigger */}
                        <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenu(activeMenu === 'primary' ? null : 'primary');
                                }}
                                className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>
                            </button>

                            {/* Dropdown Menu */}
                            {activeMenu === 'primary' && (
                                <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg py-1 z-10 animate-in fade-in zoom-in-95 duration-100">
                                    <button className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                                        Stop using for sign-in
                                    </button>
                                    <button className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                        Remove
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-4 flex gap-2 text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg border border-border">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <p>Use your primary email to receive notifications and sign in.</p>
                </div>
            </div>

            {/* Security Section */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Password */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="font-semibold text-foreground flex items-center gap-2 mb-2">
                            <Key className="w-4 h-4 text-emerald-500" />
                            Password
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Secure your account with a strong password.
                        </p>
                    </div>
                    <div className="mt-6 pt-6 border-t border-border">
                        <button
                            onClick={() => setActiveModal('change-password')}
                            className="w-full py-2 px-4 bg-background border border-border hover:bg-muted text-foreground rounded-lg text-sm font-medium transition-colors shadow-sm"
                        >
                            Change Password
                        </button>
                    </div>
                </div>

                {/* Multi-factor Authentication */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
                            <Shield className="w-4 h-4 text-indigo-500" />
                            Multi-factor Authentication
                        </h3>

                        <div className="space-y-4">
                            <div className="p-3 rounded-lg bg-muted/30 border border-border">
                                <div className="flex items-start gap-3">
                                    <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded text-indigo-600 dark:text-indigo-400">
                                        <Smartphone className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-foreground">Authenticator App</div>
                                        <div className="text-xs text-muted-foreground mt-0.5">
                                            {user.isMultiFactorRequired
                                                ? "MFA is enabled and required for sign-in."
                                                : "Use an app like Google Authenticator to generate verification codes."}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-border">
                        <button
                            onClick={() => setActiveModal('mfa')}
                            className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors shadow-sm ${user.isMultiFactorRequired
                                ? "bg-background border border-border hover:bg-muted text-foreground"
                                : "bg-indigo-600 hover:bg-indigo-700 text-white"
                                }`}
                        >
                            {user.isMultiFactorRequired ? "Manage MFA" : "Enable MFA"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {activeModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200" onClick={() => setActiveModal(null)}>
                    <div className="bg-card border border-border rounded-xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        {activeModal === 'add-email' && <AddEmailForm onClose={() => setActiveModal(null)} />}
                        {activeModal === 'change-password' && <ChangePasswordForm onClose={() => setActiveModal(null)} />}
                        {activeModal === 'mfa' && <MFAForm onClose={() => setActiveModal(null)} />}
                    </div>
                </div>
            )}
        </div>
    );
}

function AddEmailForm({ onClose }: { onClose: () => void }) {
    const user = useUser();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!user || !email) return;
        setLoading(true);
        setError('');
        try {
            await user.createContactChannel({
                type: 'email',
                value: email,
                usedForAuth: true,
            });
            onClose();
        } catch (err: unknown) {

            setError(err instanceof Error ? err.message : String(err) || "Failed to add email");
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground">Add New Email</h3>
            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email Address</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-indigo-500"
                    placeholder="you@example.com"
                />
                {error && <p className="text-xs text-red-500">{error}</p>}
            </div>
            <div className="flex justify-end gap-2 pt-2">
                <button onClick={onClose} disabled={loading} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Cancel</button>
                <button
                    onClick={handleSubmit}
                    disabled={loading || !email}
                    className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Email"}
                </button>
            </div>
        </div>
    );
}

function ChangePasswordForm({ onClose }: { onClose: () => void }) {
    const user = useUser();
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!user) return;
        setLoading(true);
        setError('');
        try {
            const err = await user.updatePassword({
                oldPassword,
                newPassword,
            });
            if (err) {
                setError(err.message);
                setLoading(false);
            } else {
                onClose();
            }
        } catch (err: unknown) {

            setError(err instanceof Error ? err.message : String(err) || "Failed to update password");
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground">Change Password</h3>
            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Current Password</label>
                <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">New Password</label>
                <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
                {error && <p className="text-xs text-red-500">{error}</p>}
            </div>
            <div className="flex justify-end gap-2 pt-2">
                <button onClick={onClose} disabled={loading} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Cancel</button>
                <button
                    onClick={handleSubmit}
                    disabled={loading || !newPassword || !oldPassword}
                    className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Password"}
                </button>
            </div>
        </div>
    );
}

function MFAForm({ onClose }: { onClose: () => void }) {
    const user = useUser();

    const project = useStackApp().useProject();
    const [generatedSecret, setGeneratedSecret] = useState<Uint8Array | null>(null);
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    const [mfaCode, setMfaCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isMaybeWrong, setIsMaybeWrong] = useState(false);

    // Check if MFA is currently enabled
    const isEnabled = user?.isMultiFactorRequired;

    // Start setup by generating secret and QR code
    useEffect(() => {
        if (!isEnabled && !generatedSecret && !isLoading) {
            const startSetup = async () => {
                try {
                    const secret = window.crypto.getRandomValues(new Uint8Array(20));

                    // Generate URI
                    const issuer = project?.displayName || "Stack App";
                    const account = user?.primaryEmail || user?.id || "User";
                    const uri = createTOTPKeyURI(issuer, account, secret, 30, 6);

                    // Generate QR Code
                    const url = await QRCode.toDataURL(uri);

                    setGeneratedSecret(secret);
                    setQrCodeUrl(url);
                } catch (e: unknown) {

                    setError("Failed to generate QR code: " + (e instanceof Error ? e.message : String(e)));
                }
            };
            startSetup();
        }
    }, [isEnabled, generatedSecret, isLoading, project, user]);

    // Handle Enable MFA Submission
    const handleEnable = async () => {
        if (!user || !generatedSecret) return;
        setIsLoading(true);
        setError(null);

        try {
            // Verify first
            const isValid = verifyTOTP(generatedSecret, 30, 6, mfaCode);
            if (!isValid) {
                setIsMaybeWrong(true);
                setIsLoading(false);
                return;
            }

            // Update user
            await user.update({

                totpMultiFactorSecret: generatedSecret
            });
            onClose();
        } catch (e: unknown) {

            setError(e instanceof Error ? e.message : String(e) || "Failed to enable MFA");
            setIsLoading(false);
        }
    };

    // Handle Disable MFA
    const handleDisable = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            await user.update({

                totpMultiFactorSecret: null
            });
            onClose();
        } catch (e: unknown) {

            setError(e instanceof Error ? e.message : String(e) || "Failed to disable MFA");
            setIsLoading(false);
        }
    };

    if (isEnabled) {
        return (
            <div className="space-y-4">
                <div className="text-center mb-4">
                    <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mb-2">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">MFA is Enabled</h3>
                    <p className="text-sm text-muted-foreground mt-1">Your account is secured with two-factor authentication.</p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <button onClick={onClose} disabled={isLoading} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Close</button>
                    <button
                        onClick={handleDisable}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Disable MFA"}
                    </button>
                </div>
                {error && <p className="text-center text-xs text-red-500 mt-2">{error}</p>}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h3 className="text-xl font-semibold text-foreground">Enable 2FA</h3>
                <p className="text-sm text-muted-foreground mt-1">Scan the QR code with your authenticator app.</p>
            </div>

            <div className="flex flex-col items-center gap-4">
                {qrCodeUrl ? (
                    <div className="p-4 bg-white rounded-xl border border-border shadow-sm">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={qrCodeUrl} alt="2FA QR Code" width={180} height={180} />
                    </div>
                ) : (
                    <div className="w-[180px] h-[180px] flex items-center justify-center bg-muted/20 rounded-xl">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                )}

                <div className="w-full space-y-2">
                    <label className="text-sm font-medium text-foreground text-center block">Enter Verification Code</label>
                    <input
                        type="text"
                        value={mfaCode}
                        onChange={(e) => {
                            setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                            setIsMaybeWrong(false);
                            setError(null);
                        }}
                        placeholder="000 000"
                        className="w-full text-center text-2xl tracking-[0.5em] font-mono rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:ring-2 focus:ring-indigo-500"
                    />
                    {isMaybeWrong && <p className="text-center text-xs text-red-500">Incorrect code. Please try again.</p>}
                    {error && <p className="text-center text-xs text-red-500">{error}</p>}
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
                <button onClick={onClose} disabled={isLoading} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Cancel</button>
                <button
                    onClick={handleEnable}
                    disabled={isLoading || mfaCode.length !== 6}
                    className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify & Enable"}
                </button>
            </div>
        </div>
    );
}
