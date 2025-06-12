
import React from 'react';
import { usePosts } from '@/hooks/usePosts';
import { useAuth } from '@/hooks/useAuth';
import CreatePost from './CreatePost';
import PostCard from './PostCard';
import { Loader2 } from 'lucide-react';

const Feed = () => {
  const { user } = useAuth();
  const { posts, loading, createPost, toggleReaction, addComment } = usePosts();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <CreatePost onCreatePost={createPost} />
      
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            ¡Sé el primero en publicar!
          </h3>
          <p className="text-muted-foreground">
            Comparte tu primer post y comienza a conectar con otros profesionales.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onToggleReaction={toggleReaction}
              onAddComment={addComment}
              currentUserId={user?.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Feed;
