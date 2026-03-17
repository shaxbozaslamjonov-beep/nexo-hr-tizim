import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const lessons = await prisma.lesson.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    // Map DB fields to the expected frontend interface
    const formattedLessons = lessons.map(lesson => ({
      id: lesson.id,
      title: { ru: lesson.titleRu, uz: lesson.titleUz },
      description: { ru: lesson.descRu || '', uz: lesson.descUz || '' },
      videoUrl: lesson.videoUrl,
      fileAttachment: lesson.fileName && lesson.fileContent ? {
        name: lesson.fileName,
        url: lesson.fileContent
      } : undefined,
      assignmentText: { ru: lesson.assignmentRu || '', uz: lesson.assignmentUz || '' },
      createdAt: lesson.createdAt.toISOString(),
      authorId: lesson.authorId || ''
    }));

    return NextResponse.json(formattedLessons);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const newLesson = await prisma.lesson.create({
      data: {
        titleRu: data.title.ru,
        titleUz: data.title.uz,
        descRu: data.description.ru,
        descUz: data.description.uz,
        videoUrl: data.videoUrl,
        fileName: data.fileAttachment?.name,
        fileContent: data.fileAttachment?.url,
        assignmentRu: data.assignmentText?.ru,
        assignmentUz: data.assignmentText?.uz,
        authorId: data.authorId
      }
    });

    return NextResponse.json(newLesson);
  } catch (error) {
    console.error('Error creating lesson:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
