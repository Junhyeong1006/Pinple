import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Category, CreatePostRequest, CATEGORIES } from '../../types';
import { useMapStore } from '../../stores/mapStore';
import { LocationPicker } from '../map/LocationPicker';
import { postsApi } from '../../services/api';
import { Image, MapPin, Send, X, Loader2 } from 'lucide-react';

interface PostFormProps {
  onSuccess: () => void;
  onCancel?: () => void;
}

interface FormInputs {
  category: Category;
  title: string;
  content: string;
  author: string;
  latitude: number;
  longitude: number;
  image?: FileList;
}

export const PostForm: React.FC<PostFormProps> = ({ onSuccess, onCancel }) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const userLocation = useMapStore((s) => s.userLocation);
  const defaultCenter = useMapStore((s) => s.center);
  const initialCoords = userLocation || defaultCenter;

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors }
  } = useForm<FormInputs>({
    defaultValues: {
      category: 'complaint',
      title: '',
      content: '',
      author: '',
      latitude: initialCoords[0],
      longitude: initialCoords[1],
    }
  });

  const selectedCategory = watch('category');
  const watchedLatitude = watch('latitude');
  const watchedLongitude = watch('longitude');

  // Sync coords if they are not yet selected but map center changes
  useEffect(() => {
    if (watchedLatitude === 0 && watchedLongitude === 0) {
      setValue('latitude', initialCoords[0]);
      setValue('longitude', initialCoords[1]);
    }
  }, [initialCoords, setValue, watchedLatitude, watchedLongitude]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type and size (max 5MB)
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드할 수 있습니다.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('이미지 용량은 최대 5MB를 넘을 수 없습니다.');
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setValue('image', undefined);
  };

  const onSubmit = async (data: FormInputs) => {
    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('category', data.category);
      formData.append('title', data.title);
      formData.append('content', data.content);
      formData.append('latitude', String(data.latitude));
      formData.append('longitude', String(data.longitude));
      
      if (data.author && data.author.trim() !== '') {
        formData.append('author', data.author.trim());
      }
      
      if (data.image && data.image.length > 0) {
        formData.append('image', data.image[0]);
      }

      await postsApi.create(formData);
      onSuccess();
    } catch (err: any) {
      setError(err.message || '게시물 작성에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-sm">
      {error && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 rounded-xl font-medium">
          ⚠️ {error}
        </div>
      )}

      {/* Category selection */}
      <div>
        <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
          카테고리
        </label>
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <label
                key={cat.key}
                className={`
                  flex flex-col items-center justify-center p-3 rounded-2xl border cursor-pointer transition-all duration-300
                  ${isSelected 
                    ? 'border-transparent text-white shadow-md' 
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
                  }
                `}
                style={{ 
                  backgroundColor: isSelected ? cat.color : undefined,
                  boxShadow: isSelected ? `0 4px 14px ${cat.glowColor}` : undefined
                }}
              >
                <input
                  type="radio"
                  value={cat.key}
                  className="sr-only"
                  {...register('category')}
                />
                <span className="text-xl mb-1">{cat.icon}</span>
                <span className="font-semibold text-xs">{cat.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Author and Title */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
            작성자 (선택)
          </label>
          <input
            type="text"
            placeholder="익명"
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-600 focus:border-transparent transition-all"
            {...register('author')}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
            제목
          </label>
          <input
            type="text"
            placeholder="어떤 정보나 민원인가요?"
            className={`
              w-full px-4 py-2.5 rounded-xl border bg-white/50 dark:bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-600 focus:border-transparent transition-all
              ${errors.title ? 'border-rose-500' : 'border-zinc-200 dark:border-zinc-800'}
            `}
            {...register('title', { required: '제목을 입력해주세요.' })}
          />
          {errors.title && (
            <p className="text-rose-500 text-xs mt-1 font-medium">{errors.title.message}</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div>
        <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
          상세 내용 (최소 10자)
        </label>
        <textarea
          rows={4}
          placeholder="여기에 상세한 내용을 작성해주세요 (최소 10자 이상)."
          className={`
            w-full px-4 py-2.5 rounded-xl border bg-white/50 dark:bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-600 focus:border-transparent transition-all resize-none
            ${errors.content ? 'border-rose-500' : 'border-zinc-200 dark:border-zinc-800'}
          `}
          {...register('content', {
            required: '내용을 입력해주세요.',
            minLength: { value: 10, message: '내용은 최소 10자 이상 작성하셔야 합니다.' }
          })}
        />
        {errors.content && (
          <p className="text-rose-500 text-xs mt-1 font-medium">{errors.content.message}</p>
        )}
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
          현장 사진 (선택, 최대 5MB)
        </label>
        
        {imagePreview ? (
          <div className="relative rounded-xl overflow-hidden aspect-video border border-zinc-200 dark:border-zinc-800 bg-black/5">
            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-violet-400 dark:hover:border-violet-800 rounded-xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-all">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Image className="w-8 h-8 text-zinc-400 mb-2" />
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">클릭하거나 사진 파일을 여기에 드래그</p>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">PNG, JPG (최대 5MB)</p>
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              {...register('image')}
              onChange={handleImageChange}
            />
          </label>
        )}
      </div>

      {/* Location Picker */}
      <div>
        <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
          위치 꽂기 (지도 클릭)
        </label>
        <div className="h-60 w-full rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-inner">
          <Controller
            name="latitude"
            control={control}
            render={({ field }) => (
              <LocationPicker
                value={{ latitude: watchedLatitude, longitude: watchedLongitude }}
                onChange={(coords) => {
                  setValue('latitude', coords.latitude);
                  setValue('longitude', coords.longitude);
                }}
              />
            )}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl font-semibold border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 disabled:opacity-50 transition"
          >
            취소
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-600/20 hover:shadow-violet-600/30 disabled:opacity-50 transition"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              등록 중...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              게시글 등록
            </>
          )}
        </button>
      </div>
    </form>
  );
};
