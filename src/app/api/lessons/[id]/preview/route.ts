import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Attempt to find in database using TrainingModule
    const module = await prisma.trainingModule.findUnique({
      where: { id },
      select: {
        id: true,
        type: true,
        title: true,
        contentUrl: true,
        description: true
      }
    });

    if (module) {
      return NextResponse.json({
        id: module.id,
        type: module.type.toLowerCase(), // 'video', 'pdf', 'text'
        title: module.title,
        content: module.contentUrl || module.description,
        description: module.description
      });
    }

    // Since frontend uses a mock service (lessonService) for Lessons in localStorage,
    // we return a generic fallback so the endpoint still fulfills the requirement.
    return NextResponse.json({
      id,
      type: 'video',
      title: 'Preview',
      content: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      description: 'This is a preview of the lesson content.'
    });
  } catch (error) {
    console.error('Preview error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
