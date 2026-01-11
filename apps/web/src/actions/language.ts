'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function setLanguage(locale: 'id' | 'en') {
    const cookieStore = await cookies();
    cookieStore.set('locale', locale, { path: '/', maxAge: 60 * 60 * 24 * 365 }); // 1 year
    revalidatePath('/');
}
