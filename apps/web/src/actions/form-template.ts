'use server';

import { prisma } from '@/lib/db';
import { requireAdmin, getCurrentUser } from '@/actions/auth';
import { PROJECT_FORM_FIELDS } from '@/config/project-form';
import { revalidatePath } from 'next/cache';

export interface FormField {
    key: string;
    label: string;
    type: 'text' | 'number' | 'select' | 'date' | 'checkbox-group';
    placeholder?: string;
    options?: string[]; // For select inputs
    required?: boolean;
    visibility?: {
        fieldKey: string;
        operator: 'eq' | 'neq' | 'in';
        value: string | string[];
    };
}

/**
 * Get the form template for the current user's organization.
 * Falls back to the default config if no template exists.
 */
export async function getFormTemplate() {
    const user = await getCurrentUser();
    if (!user || !user.organizationId) return PROJECT_FORM_FIELDS;

    const template = await prisma.organizationFormTemplate.findUnique({
        where: { organizationId: user.organizationId }
    });

    if (!template || !template.fields) return PROJECT_FORM_FIELDS;

    return template.fields as unknown as FormField[];
}

/**
 * Update the form template for the current admin's organization.
 */
import { FormTemplateSchema } from '@/lib/validation';

export async function updateFormTemplate(fields: FormField[]) {
    const admin = await requireAdmin();
    if (!admin.organizationId) throw new Error('No Organization selected');

    // Validate Input
    const validated = FormTemplateSchema.parse({ fields });

    await prisma.organizationFormTemplate.upsert({
        where: { organizationId: admin.organizationId },
        create: {
            organizationId: admin.organizationId,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            fields: validated.fields as any
        },
        update: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            fields: validated.fields as any
        }
    });

    revalidatePath('/projects');
    revalidatePath('/settings/project-form'); // Assuming this will be the settings page
}
