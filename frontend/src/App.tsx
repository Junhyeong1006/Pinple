import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { useThemeStore } from './stores/themeStore';

// Page imports
import HomePage from './pages/HomePage';
import ListPage from './pages/ListPage';
import CreatePostPage from './pages/CreatePostPage';
import PostDetailPage from './pages/PostDetailPage';

function App() {
  const initializeTheme = useThemeStore((s) => s.initialize);

  useEffect(() => {
    // Sync theme options with classList on startup
    initializeTheme();
  }, [initializeTheme]);

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/list" element={<ListPage />} />
          <Route path="/create" element={<CreatePostPage />} />
          <Route path="/posts/:id" element={<PostDetailPage />} />
          <Route path="*" element={
            <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
              <p className="text-zinc-500 font-semibold">페이지를 찾을 수 없습니다.</p>
              <a href="/" className="px-5 py-2.5 bg-violet-600 text-white font-bold rounded-xl transition hover:bg-violet-700 shadow-lg shadow-violet-500/10">
                홈 지도로 가기
              </a>
            </div>
          } />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
