'use server';

import { s3Client, R2_BUCKET_NAME } from '@/lib/storage';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getCurrentUser } from './auth';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getPresignedUploadUrl(taskId: string, fileName: string, fileType: string) {
    const user = await getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    // Create a clean file key: tasks/{taskId}/{timestamp}-{sanitized_filename}
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileKey = `tasks/${taskId}/${Date.now()}-${sanitizedFileName}`;

    const command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: fileKey,
        ContentType: fileType,
        Metadata: {
            uploadedBy: user.id
        }
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 }); // 5 minutes

    // Construct the public URL (assuming public access or worker is set up)
    // If using custom domain: https://cdn.example.com/{fileKey}
    // For now, return the key so the frontend can store it, or construct a URL if R2_PUBLIC_URL is env
    const publicUrl = process.env.R2_PUBLIC_URL
        ? `${process.env.R2_PUBLIC_URL}/${fileKey}`
        : `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET_NAME}/${fileKey}`; // Raw R2 URL (usually needs auth or public bucket)

    return { uploadUrl, fileKey, publicUrl };
}

export async function updateTaskAttachment(taskId: string, attachmentUrl: string) {
    const user = await getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    // Verify task exists and user has access (basic check)
    const task = await prisma.projectItem.findUnique({
        where: { id: taskId },
        include: { project: true }
    });

    if (!task) throw new Error('Task not found');

    // Authorization: User must be assigned, or admin, or creator
    // Simplified for now: Logged in user can upload if they can see the task
    // TODO: stricter RBAC

    await prisma.projectItem.update({
        where: { id: taskId },
        data: { attachmentUrl } as any // Temporary bypass
    });

    revalidatePath(`/projects/${task.projectId}`);
}

export async function deleteTaskAttachment(taskId: string) {
    const user = await getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    const task = await prisma.projectItem.findUnique({
        where: { id: taskId },
        select: { id: true, projectId: true, attachmentUrl: true } as any
    });

    if (!task) throw new Error('Task not found');
    const attachmentUrl = (task as any).attachmentUrl; // Temporary cast
    if (!attachmentUrl) return; // Nothing to delete

    // Extract File Key from URL
    // URL Format 1 (Custom): https://cdn.example.com/tasks/123/filename.ext
    // URL Format 2 (Default): https://...r2.cloudflarestorage.com/bucket/tasks/123/filename.ext
    // We assume the key starts with "tasks/"
    // A simple way is to split by bucket name or just grep "tasks/"

    let fileKey = '';
    try {
        const url = new URL(attachmentUrl);
        // If path is /bucket-name/tasks/..., remove first part.  
        // If path is /tasks/..., keep it.
        // Quick hack: find index of "tasks/"
        const keyIndex = url.pathname.indexOf('tasks/');
        if (keyIndex !== -1) {
            fileKey = url.pathname.substring(keyIndex);
        } else {
            // Fallback: maybe just pathname relative?
            fileKey = url.pathname.substring(1); // remove leading slash
        }
    } catch {
        console.error("Invalid URL format in DB:", attachmentUrl);
        // Fallback: if we can't parse URL, we can't delete from R2 safely without guessing.
        // For now, we proceed to clear DB to keep app consistent, but maybe log error.
    }

    if (fileKey) {
        try {
            const command = new DeleteObjectCommand({
                Bucket: R2_BUCKET_NAME,
                Key: fileKey,
            });
            await s3Client.send(command);
        } catch (error) {
            console.error("Failed to delete from R2:", error);
            // We continue to update DB so UI is responsive, leaving orphan file is lesser evil than broken UI
        }
    }

    await prisma.projectItem.update({
        where: { id: taskId },
        data: { attachmentUrl: null } as any
    });

    revalidatePath(`/projects/${task.projectId}`);
}
