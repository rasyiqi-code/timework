'use server';

import { getCurrentUser } from './auth';
import { seedKBMData } from '@/lib/seed';
import { revalidatePath } from 'next/cache';

export async function loadDemoDataAction() {
    const user = await getCurrentUser();

    if (!user || !user.organizationId) {
        throw new Error('User must belong to an organization to load demo data.');
    }

    try {
        await seedKBMData(user.organizationId, user.id);
        revalidatePath('/admin/protocols');
        revalidatePath('/account-settings/general');
        return { success: true };
    } catch (error) {
        console.error('Failed to load demo data:', error);
        return { success: false, error: 'Failed to insert demo data' };
    }
}
