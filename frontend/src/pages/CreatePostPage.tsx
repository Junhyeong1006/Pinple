import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PostForm } from '../components/posts/PostForm';
import { ArrowLeft } from 'lucide-react';

export default function CreatePostPage() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    // Redirect to home map page on success
    navigate('/');
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl glass rounded-3xl p-6 sm:p-8 shadow-xl border border-zinc-200/50 dark:border-zinc-800/50 relative overflow-hidden">
        {/* Decorative subtle background glows */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Back and Title Header */}
        <div className="flex items-center gap-3 mb-6 relative">
          <button 
            onClick={handleCancel}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 rounded-xl text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-zinc-950 dark:text-white leading-tight">
              새로운 글 올리기
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
              동네 소식, 건의 사항, 불편한 민원 등 현장의 목소리를 지도에 기록해보세요.
            </p>
          </div>
        </div>

        {/* The Form */}
        <PostForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </div>
  );
}
