'use server';

import { cookies } from 'next/headers';
import { dictionaries, type Dictionary } from './dictionaries';

export async function getDictionary(): Promise<Dictionary> {
    const cookieStore = await cookies();
    const locale = cookieStore.get('locale')?.value;

    if (locale === 'en') {
        return dictionaries.en;
    }

    // Default to ID
    return dictionaries.id;
}

export async function getLocale(): Promise<'id' | 'en'> {
    const cookieStore = await cookies();
    const locale = cookieStore.get('locale')?.value;
    return locale === 'en' ? 'en' : 'id';
}
