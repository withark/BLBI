import { PostEditClient } from "./post-edit-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PostEditPage({ params }: PageProps): Promise<React.ReactNode> {
  const { id } = await params;
  return <PostEditClient postId={id} />;
}
