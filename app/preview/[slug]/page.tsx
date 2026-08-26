import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PreviewClient from './PreviewClient';

interface PreviewPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PreviewPageProps): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const formattedTitle = decodedSlug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());

  return {
    title: `${formattedTitle} | Official Practice Website Preview`,
    description: `Official turnkey online portal and patient consultation platform preview for ${formattedTitle}. Powered by My Compass Consulting with 24-month w4 secure cloud hosting.`,
  };
}

export default async function PreviewPage({ params }: PreviewPageProps) {
  const { slug } = await params;
  if (!slug) {
    notFound();
  }

  return <PreviewClient slug={slug} />;
}
