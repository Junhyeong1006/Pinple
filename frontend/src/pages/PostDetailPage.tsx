import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PostDetail } from '../components/posts/PostDetail';

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const postId = id ? parseInt(id, 10) : NaN;

  const handleClose = () => {
    // Go back or fall back to map
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  if (isNaN(postId)) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
        <p className="text-zinc-500 font-semibold">유효하지 않은 게시글 번호입니다.</p>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 bg-violet-600 text-white font-bold rounded-xl transition hover:bg-violet-700"
        >
          홈 지도로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 max-w-2xl mx-auto w-full">
      <div className="w-full glass rounded-3xl overflow-hidden shadow-xl border border-zinc-200/50 dark:border-zinc-800/50 h-[85vh]">
        <PostDetail 
          postId={postId} 
          onClose={handleClose} 
          onDeleteSuccess={() => navigate('/')}
        />
      </div>
    </div>
  );
}
