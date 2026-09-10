'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { CourseStatusBadge } from '@/components/instructor/CourseStatusBadge';
import { PublicationChecklist } from '@/components/instructor/PublicationChecklist';
import { VideoRecorderModal } from '@/components/instructor/VideoRecorderModal';
import {
  ArrowLeft,
  Save,
  Loader2,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Globe,
  EyeOff,
  FileText,
  Video,
  BookOpen,
  Layers,
  Settings2,
  ShieldCheck,
  Archive,
} from 'lucide-react';
import type {
  CourseWithCurriculum,
  CourseContentLevel,
  CoursePricingType,
  CoursePublicationValidationResult,
  DbCourseModule,
  DbCourseLesson,
} from '@/types/course';

type ActiveTab = 'info' | 'curriculum' | 'publication';

const CATEGORIES = [
  'Développement', 'Design', 'Marketing', 'Business',
  'Finance', 'Langues', 'Sciences', 'Musique', 'Santé', 'Autre',
];
const LEVELS: CourseContentLevel[] = ['Débutant', 'Intermédiaire', 'Avancé'];

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  const { user, profile, isLoading: authLoading } = useAuth();

  // Course data
  const [course, setCourse] = useState<CourseWithCurriculum | null>(null);
  const [isLoadingCourse, setIsLoadingCourse] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Active tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('info');

  // Info form
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Développement');
  const [level, setLevel] = useState<CourseContentLevel>('Débutant');
  const [duration, setDuration] = useState('');
  const [pricingType, setPricingType] = useState<CoursePricingType>('free');
  const [price, setPrice] = useState(0);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [isSavingInfo, setIsSavingInfo] = useState(false);
  const [infoMessage, setInfoMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Curriculum
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);

  // New lesson form per module
  const [addingLessonModuleId, setAddingLessonModuleId] = useState<string | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonType, setNewLessonType] = useState<'video' | 'text'>('video');
  const [newLessonDuration, setNewLessonDuration] = useState('10 min');
  const [newLessonVideoUrl, setNewLessonVideoUrl] = useState('');
  const [newLessonTextContent, setNewLessonTextContent] = useState('');
  const [isCreatingLesson, setIsCreatingLesson] = useState(false);
  const [lessonFormError, setLessonFormError] = useState<string | null>(null);

  // Video recorder modal
  const [isVideoRecorderOpen, setIsVideoRecorderOpen] = useState(false);
  const [videoTarget, setVideoTarget] = useState<'new' | 'edit'>('new');

  // Edit lesson form
  const [editLessonTitle, setEditLessonTitle] = useState('');
  const [editLessonType, setEditLessonType] = useState<'video' | 'text'>('video');
  const [editLessonDuration, setEditLessonDuration] = useState('');
  const [editLessonVideoUrl, setEditLessonVideoUrl] = useState('');
  const [editLessonTextContent, setEditLessonTextContent] = useState('');
  const [isSavingLesson, setIsSavingLesson] = useState(false);

  // Publication
  const [validation, setValidation] = useState<CoursePublicationValidationResult | null>(null);
  const [isCheckingPublication, setIsCheckingPublication] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUnpublishing, setIsUnpublishing] = useState(false);
  const [pubMessage, setPubMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Delete
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteFeedback, setDeleteFeedback] = useState<{ action: 'archived' | 'deleted'; message: string } | null>(null);

  // Operation feedback
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load course data
  const loadCourse = useCallback(async () => {
    if (!courseId) return;
    setIsLoadingCourse(true);
    setLoadError(null);

    try {
      const response = await fetch(`/api/instructor/courses/${courseId}`);
      const data = await response.json();

      if (!response.ok) {
        setLoadError(data.error || 'Formation introuvable.');
        setIsLoadingCourse(false);
        return;
      }

      const c = data.course as CourseWithCurriculum;
      setCourse(c);

      // Populate form fields
      setTitle(c.title || '');
      setSubtitle(c.subtitle || '');
      setDescription(c.description || '');
      setCategory(c.category || 'Développement');
      setLevel(c.level || 'Débutant');
      setDuration(c.duration || '');
      setPricingType(c.pricing_type || 'free');
      setPrice(c.price || 0);
      setThumbnailUrl(c.thumbnail_url || '');

      setIsLoadingCourse(false);
    } catch (err) {
      console.error('[EditCourse] Erreur chargement:', err);
      setLoadError('Erreur lors du chargement de la formation.');
      setIsLoadingCourse(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (user?.id) {
      loadCourse();
    }
  }, [user?.id, loadCourse]);

  // Auth redirect
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/connexion?redirect=/formateur');
    }
  }, [user, authLoading, router]);

  // Role check
  const role = profile?.role || (user?.user_metadata?.role as string) || 'student';
  const isInstructor = role === 'instructor' || role === 'admin';

  if (authLoading || !user) {
    return (
      <div className="py-16 text-center text-xs text-gray-400">
        Vérification des droits formateur...
      </div>
    );
  }

  if (!isInstructor) {
    router.replace('/formateur');
    return null;
  }

  if (isLoadingCourse) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center">
        <Loader2 className="w-6 h-6 text-[#5C4DF5] animate-spin mx-auto mb-3" />
        <p className="text-xs text-gray-500">Chargement de la formation…</p>
      </div>
    );
  }

  if (loadError || !course) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center">
        <div className="bg-white rounded-2xl border border-red-100 p-8 shadow-sm space-y-4">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
          <p className="text-sm text-red-600 font-medium">{loadError || 'Formation introuvable.'}</p>
          <Link
            href="/formateur"
            className="inline-flex items-center gap-2 text-xs text-[#5C4DF5] font-semibold hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Retour au dashboard
          </Link>
        </div>
      </div>
    );
  }

  // =====================================================================
  // HANDLERS
  // =====================================================================

  const handleSaveInfo = async () => {
    setIsSavingInfo(true);
    setInfoMessage(null);

    try {
      const response = await fetch(`/api/instructor/courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, subtitle, description, category, level,
          duration, pricing_type: pricingType,
          price: pricingType === 'paid' ? price : 0,
          thumbnail_url: thumbnailUrl || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setInfoMessage({ type: 'error', text: data.error || 'Erreur.' });
      } else {
        setInfoMessage({ type: 'success', text: 'Informations sauvegardées.' });
        await loadCourse();
      }
    } catch {
      setInfoMessage({ type: 'error', text: 'Erreur réseau.' });
    } finally {
      setIsSavingInfo(false);
    }
  };

  // Module handlers
  const handleAddModule = async () => {
    if (!newModuleTitle.trim()) return;
    setIsAddingModule(true);
    setActionMessage(null);

    try {
      const response = await fetch(`/api/instructor/courses/${courseId}/modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newModuleTitle.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setActionMessage({ type: 'error', text: data.error || 'Erreur.' });
      } else {
        setNewModuleTitle('');
        setActionMessage({ type: 'success', text: 'Module ajouté.' });
        await loadCourse();
      }
    } catch {
      setActionMessage({ type: 'error', text: 'Erreur réseau.' });
    } finally {
      setIsAddingModule(false);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    setActionMessage(null);

    try {
      const response = await fetch(`/api/instructor/courses/${courseId}/modules/${moduleId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        setActionMessage({ type: 'error', text: data.error || 'Erreur.' });
      } else {
        setActionMessage({ type: 'success', text: 'Module supprimé.' });
        await loadCourse();
      }
    } catch {
      setActionMessage({ type: 'error', text: 'Erreur réseau.' });
    }
  };

  const handleUpdateModuleOrder = async (moduleId: string, newOrder: number) => {
    try {
      await fetch(`/api/instructor/courses/${courseId}/modules/${moduleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sort_order: newOrder }),
      });
      await loadCourse();
    } catch {
      // Silently fail on reorder
    }
  };

  // Lesson handlers
  const handleAddLesson = async (moduleId: string) => {
    const targetModule = course?.modules.find((m) => m.id === moduleId);
    const lessonIndex = (targetModule?.lessons?.length || 0) + 1;
    const finalTitle = newLessonTitle.trim() || `Leçon ${lessonIndex}`;

    setIsCreatingLesson(true);
    setLessonFormError(null);
    setActionMessage(null);

    try {
      const response = await fetch(`/api/instructor/courses/${courseId}/modules/${moduleId}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: finalTitle,
          content_type: newLessonType,
          duration: newLessonDuration.trim() || '10 min',
          video_url: newLessonType === 'video' ? newLessonVideoUrl.trim() : undefined,
          text_content: newLessonType === 'text' ? newLessonTextContent.trim() : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg =
          data.error && !data.error.includes('[') && !data.error.includes('Supabase')
            ? data.error
            : 'Impossible d’ajouter la leçon pour le moment.';
        setLessonFormError(errorMsg);
      } else {
        resetNewLessonForm();
        setActionMessage({ type: 'success', text: 'Leçon ajoutée avec succès !' });
        await loadCourse();
      }
    } catch {
      setLessonFormError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsCreatingLesson(false);
    }
  };

  const resetNewLessonForm = () => {
    setAddingLessonModuleId(null);
    setNewLessonTitle('');
    setNewLessonType('video');
    setNewLessonDuration('10 min');
    setNewLessonVideoUrl('');
    setNewLessonTextContent('');
    setLessonFormError(null);
  };

  const startEditLesson = (lesson: DbCourseLesson) => {
    setEditingLessonId(lesson.id);
    setEditLessonTitle(lesson.title);
    setEditLessonType(lesson.content_type);
    setEditLessonDuration(lesson.duration);
    setEditLessonVideoUrl(lesson.video_url || '');
    setEditLessonTextContent(lesson.text_content || '');
  };

  const handleSaveLesson = async (moduleId: string, lessonId: string) => {
    setIsSavingLesson(true);
    setActionMessage(null);

    try {
      const response = await fetch(`/api/instructor/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editLessonTitle.trim(),
          content_type: editLessonType,
          duration: editLessonDuration,
          video_url: editLessonType === 'video' ? editLessonVideoUrl : undefined,
          text_content: editLessonType === 'text' ? editLessonTextContent : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setActionMessage({ type: 'error', text: data.error || 'Erreur.' });
      } else {
        setEditingLessonId(null);
        setActionMessage({ type: 'success', text: 'Leçon modifiée.' });
        await loadCourse();
      }
    } catch {
      setActionMessage({ type: 'error', text: 'Erreur réseau.' });
    } finally {
      setIsSavingLesson(false);
    }
  };

  const handleDeleteLesson = async (moduleId: string, lessonId: string) => {
    setActionMessage(null);

    try {
      const response = await fetch(`/api/instructor/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        setActionMessage({ type: 'error', text: data.error || 'Erreur.' });
      } else {
        setActionMessage({ type: 'success', text: 'Leçon supprimée.' });
        await loadCourse();
      }
    } catch {
      setActionMessage({ type: 'error', text: 'Erreur réseau.' });
    }
  };

  // Publication
  const handleCheckPublication = async () => {
    setIsCheckingPublication(true);
    setPubMessage(null);

    try {
      const response = await fetch(`/api/instructor/courses/${courseId}/publish`);
      const data = await response.json();

      if (data.validation) {
        setValidation(data.validation);
      }
    } catch {
      setPubMessage({ type: 'error', text: 'Erreur de vérification.' });
    } finally {
      setIsCheckingPublication(false);
    }
  };

  const handlePublish = async () => {
    if (isPublishing) return;
    setIsPublishing(true);
    setPubMessage(null);

    try {
      const response = await fetch(`/api/instructor/courses/${courseId}/publish`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        const errorText = data.errors && data.errors.length > 0
          ? data.errors.join(' • ')
          : (data.error || 'Publication impossible.');
        setPubMessage({ type: 'error', text: errorText });
      } else {
        setPubMessage({ type: 'success', text: 'Formation publiée avec succès !' });
        await loadCourse();
      }
    } catch {
      setPubMessage({ type: 'error', text: 'Erreur réseau.' });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    if (isUnpublishing) return;
    setIsUnpublishing(true);
    setPubMessage(null);

    try {
      const response = await fetch(`/api/instructor/courses/${courseId}/unpublish`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        setPubMessage({ type: 'error', text: data.error || 'Dépublication impossible.' });
      } else {
        setPubMessage({ type: 'success', text: 'Formation dépubliée.' });
        await loadCourse();
      }
    } catch {
      setPubMessage({ type: 'error', text: 'Erreur réseau.' });
    } finally {
      setIsUnpublishing(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteFeedback(null);

    try {
      const response = await fetch(`/api/instructor/courses/${courseId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        setActionMessage({ type: 'error', text: data.error || 'Suppression impossible.' });
        setShowDeleteConfirm(false);
      } else {
        const actionType = data.action as 'archived' | 'deleted';
        const msg = data.message || (actionType === 'archived'
          ? 'Formation archivée pour préserver l\'accès des élèves inscrits.'
          : 'Formation définitivement supprimée.');

        setDeleteFeedback({ action: actionType, message: msg });
        setShowDeleteConfirm(false);

        if (actionType === 'archived') {
          setActionMessage({ type: 'success', text: msg });
          await loadCourse();
        } else {
          setActionMessage({ type: 'success', text: `${msg} Redirection en cours…` });
          setTimeout(() => {
            router.push('/formateur');
          }, 1500);
        }
      }
    } catch {
      setActionMessage({ type: 'error', text: 'Erreur réseau.' });
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // =====================================================================
  // TABS
  // =====================================================================
  const tabs: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'info', label: 'Informations', icon: Settings2 },
    { id: 'curriculum', label: 'Programme', icon: Layers },
    { id: 'publication', label: 'Publication', icon: ShieldCheck },
  ];

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-10 px-4 space-y-5">

      {/* Retour + en-tête */}
      <div>
        <Link
          href="/formateur"
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#5C4DF5] font-medium transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Dashboard formateur
        </Link>

        <div className="bg-white rounded-2xl border border-[#F0F2F6] p-5 sm:p-6 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight truncate">
                {course.title}
              </h1>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="text-[11px] text-gray-500">{course.category}</span>
                <span className="text-gray-300">·</span>
                <span className="text-[11px] text-gray-500">{course.level}</span>
                <span className="text-gray-300">·</span>
                <span className={`text-[11px] font-semibold ${course.pricing_type === 'free' ? 'text-emerald-600' : 'text-[#5C4DF5]'}`}>
                  {course.pricing_type === 'free' ? 'Gratuite' : `${new Intl.NumberFormat('fr-FR').format(course.price)} XOF`}
                </span>
              </div>
            </div>
            <CourseStatusBadge status={course.status} size="md" />
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white text-[#5C4DF5] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.slice(0, 5)}.</span>
            </button>
          );
        })}
      </div>

      {/* Action message */}
      {actionMessage && (
        <div className={`text-xs px-3 py-2 rounded-lg font-medium ${
          actionMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
        }`}>
          {actionMessage.text}
        </div>
      )}

      {/* ============================================== */}
      {/* TAB: INFORMATIONS */}
      {/* ============================================== */}
      {activeTab === 'info' && (
        <div className="bg-white rounded-2xl border border-[#F0F2F6] p-5 sm:p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-900">Informations générales</h2>

          {infoMessage && (
            <div className={`text-xs px-3 py-2 rounded-lg font-medium ${
              infoMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
            }`}>
              {infoMessage.text}
            </div>
          )}

          {/* Titre */}
          <div>
            <label htmlFor="edit-title" className="block text-xs font-semibold text-gray-700 mb-1">Titre *</label>
            <input id="edit-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5C4DF5]/20 focus:border-[#5C4DF5] transition-all" />
          </div>

          {/* Sous-titre */}
          <div>
            <label htmlFor="edit-subtitle" className="block text-xs font-semibold text-gray-700 mb-1">Sous-titre</label>
            <input id="edit-subtitle" type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5C4DF5]/20 focus:border-[#5C4DF5] transition-all" />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="edit-desc" className="block text-xs font-semibold text-gray-700 mb-1">Description *</label>
            <textarea id="edit-desc" rows={4} value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5C4DF5]/20 focus:border-[#5C4DF5] transition-all resize-y" />
          </div>

          {/* Catégorie + Niveau */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-category" className="block text-xs font-semibold text-gray-700 mb-1">Catégorie</label>
              <select id="edit-category" value={category} onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5C4DF5]/20 focus:border-[#5C4DF5] bg-white cursor-pointer">
                {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="edit-level" className="block text-xs font-semibold text-gray-700 mb-1">Niveau</label>
              <select id="edit-level" value={level} onChange={(e) => setLevel(e.target.value as CourseContentLevel)}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5C4DF5]/20 focus:border-[#5C4DF5] bg-white cursor-pointer">
                {LEVELS.map((lv) => <option key={lv} value={lv}>{lv}</option>)}
              </select>
            </div>
          </div>

          {/* Durée + URL image */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-duration" className="block text-xs font-semibold text-gray-700 mb-1">Durée estimée</label>
              <input id="edit-duration" type="text" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Ex : 3h 30min"
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5C4DF5]/20 focus:border-[#5C4DF5] transition-all" />
            </div>
            <div>
              <label htmlFor="edit-thumbnail" className="block text-xs font-semibold text-gray-700 mb-1">URL image</label>
              <input id="edit-thumbnail" type="text" value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} placeholder="https://..."
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5C4DF5]/20 focus:border-[#5C4DF5] transition-all" />
            </div>
          </div>

          {/* Tarification */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tarification</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setPricingType('free')}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${pricingType === 'free' ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-200' : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100'}`}>
                Gratuite
              </button>
              <button type="button" onClick={() => setPricingType('paid')}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${pricingType === 'paid' ? 'bg-[#EDE9FE] text-[#5C4DF5] border-2 border-[#5C4DF5]/30' : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100'}`}>
                Payante
              </button>
            </div>
          </div>

          {pricingType === 'paid' && (
            <div>
              <label htmlFor="edit-price" className="block text-xs font-semibold text-gray-700 mb-1">Prix (XOF)</label>
              <input id="edit-price" type="number" min={0} value={price} onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5C4DF5]/20 focus:border-[#5C4DF5] transition-all" />
            </div>
          )}

          {/* Save */}
          <button type="button" onClick={handleSaveInfo} disabled={isSavingInfo}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#5C4DF5] hover:bg-[#4B3CE0] disabled:opacity-60 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer">
            {isSavingInfo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isSavingInfo ? 'Sauvegarde…' : 'Sauvegarder'}</span>
          </button>
        </div>
      )}

      {/* ============================================== */}
      {/* TAB: PROGRAMME (CURRICULUM) */}
      {/* ============================================== */}
      {activeTab === 'curriculum' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#F0F2F6] p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-900">
                Modules et leçons
              </h2>
              <span className="text-[11px] text-gray-500">
                {course.modules.length} module{course.modules.length > 1 ? 's' : ''}
              </span>
            </div>

            {/* Modules list */}
            {course.modules.length === 0 ? (
              <div className="text-center py-6">
                <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-500">Aucun module. Commencez par en ajouter un.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {course.modules.map((mod, modIndex) => (
                  <div key={mod.id} className="border border-gray-100 rounded-xl overflow-hidden">
                    {/* Module header */}
                    <div className="bg-gray-50 px-4 py-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[11px] font-bold text-gray-400 shrink-0">
                          M{modIndex + 1}
                        </span>
                        <h3 className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                          {mod.title}
                        </h3>
                        <span className="text-[10px] text-gray-400 shrink-0">
                          ({mod.lessons?.length || 0} leçon{(mod.lessons?.length || 0) > 1 ? 's' : ''})
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {modIndex > 0 && (
                          <button type="button" onClick={() => handleUpdateModuleOrder(mod.id, mod.sort_order - 1)}
                            className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 cursor-pointer" title="Monter">
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {modIndex < course.modules.length - 1 && (
                          <button type="button" onClick={() => handleUpdateModuleOrder(mod.id, mod.sort_order + 1)}
                            className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 cursor-pointer" title="Descendre">
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button type="button" onClick={() => handleDeleteModule(mod.id)}
                          className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 cursor-pointer" title="Supprimer">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Lessons */}
                    <div className="divide-y divide-gray-50">
                      {(mod.lessons || []).map((lesson) => (
                        <div key={lesson.id} className="px-4 py-2.5">
                          {editingLessonId === lesson.id ? (
                            // Edit mode
                            <div className="space-y-2">
                              <input type="text" value={editLessonTitle} onChange={(e) => setEditLessonTitle(e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#5C4DF5]/20 focus:border-[#5C4DF5]" />
                              <div className="grid grid-cols-2 gap-2">
                                <select value={editLessonType} onChange={(e) => setEditLessonType(e.target.value as 'video' | 'text')}
                                  className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-white cursor-pointer">
                                  <option value="video">Vidéo</option>
                                  <option value="text">Texte</option>
                                </select>
                                <input type="text" value={editLessonDuration} onChange={(e) => setEditLessonDuration(e.target.value)} placeholder="Durée"
                                  className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#5C4DF5]/20" />
                              </div>
                              {editLessonType === 'video' ? (
                                <div className="space-y-1.5">
                                  <div className="flex gap-2 items-center">
                                    <input type="text" value={editLessonVideoUrl} onChange={(e) => setEditLessonVideoUrl(e.target.value)} placeholder="URL vidéo"
                                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#5C4DF5]/20" />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setVideoTarget('edit');
                                        setIsVideoRecorderOpen(true);
                                      }}
                                      className="inline-flex items-center gap-1 bg-[#EDE9FE] hover:bg-[#E0DCFE] text-[#5C4DF5] text-xs font-semibold px-2.5 py-2 rounded-lg transition-all cursor-pointer shrink-0"
                                      title="Créer ou enregistrer une vidéo"
                                    >
                                      <Video className="w-3.5 h-3.5" />
                                      <span>Filmer</span>
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <textarea rows={3} value={editLessonTextContent} onChange={(e) => setEditLessonTextContent(e.target.value)} placeholder="Contenu texte"
                                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#5C4DF5]/20 resize-y" />
                              )}
                              <div className="flex gap-2">
                                <button type="button" onClick={() => handleSaveLesson(mod.id, lesson.id)} disabled={isSavingLesson}
                                  className="inline-flex items-center gap-1 bg-[#5C4DF5] hover:bg-[#4B3CE0] text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg cursor-pointer disabled:opacity-60">
                                  {isSavingLesson ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                  Sauver
                                </button>
                                <button type="button" onClick={() => setEditingLessonId(null)}
                                  className="text-[11px] text-gray-500 hover:text-gray-700 font-medium cursor-pointer">
                                  Annuler
                                </button>
                              </div>
                            </div>
                          ) : (
                            // View mode
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                {lesson.content_type === 'video' ? (
                                  <Video className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                ) : (
                                  <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                )}
                                <span className="text-xs text-gray-800 truncate">{lesson.title}</span>
                                <span className="text-[10px] text-gray-400 shrink-0">{lesson.duration}</span>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button type="button" onClick={() => startEditLesson(lesson)}
                                  className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-[#5C4DF5] cursor-pointer" title="Modifier">
                                  <Edit3 className="w-3 h-3" />
                                </button>
                                <button type="button" onClick={() => handleDeleteLesson(mod.id, lesson.id)}
                                  className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 cursor-pointer" title="Supprimer">
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Add lesson form for this module */}
                      {addingLessonModuleId === mod.id ? (
                        <div className="px-4 py-3 bg-gray-50/70 rounded-b-xl space-y-2.5 border-t border-gray-100">
                          {lessonFormError && (
                            <div className="text-xs bg-red-50 text-red-700 border border-red-100 px-3 py-2 rounded-xl flex items-center gap-2">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-500" />
                              <span>{lessonFormError}</span>
                            </div>
                          )}
                          <input
                            type="text"
                            value={newLessonTitle}
                            onChange={(e) => {
                              setNewLessonTitle(e.target.value);
                              if (lessonFormError) setLessonFormError(null);
                            }}
                            placeholder={`Titre de la leçon (optionnel, par défaut : Leçon ${(mod.lessons?.length || 0) + 1})`}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#5C4DF5]/20 focus:border-[#5C4DF5] bg-white transition-all"
                            autoFocus
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <select
                              value={newLessonType}
                              onChange={(e) => setNewLessonType(e.target.value as 'video' | 'text')}
                              className="border border-gray-200 rounded-xl px-2.5 py-2 text-xs bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#5C4DF5]/20"
                            >
                              <option value="video">Vidéo</option>
                              <option value="text">Texte</option>
                            </select>
                            <input
                              type="text"
                              value={newLessonDuration}
                              onChange={(e) => setNewLessonDuration(e.target.value)}
                              placeholder="Durée (ex: 10 min)"
                              className="border border-gray-200 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#5C4DF5]/20 bg-white"
                            />
                          </div>
                          {newLessonType === 'video' ? (
                            <div className="space-y-1.5">
                              <div className="flex gap-2 items-center">
                                <input
                                  type="text"
                                  value={newLessonVideoUrl}
                                  onChange={(e) => {
                                    setNewLessonVideoUrl(e.target.value);
                                    if (lessonFormError) setLessonFormError(null);
                                  }}
                                  placeholder="URL de la vidéo (YouTube, Vimeo, lien MP4 direct...)"
                                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#5C4DF5]/20 focus:border-[#5C4DF5] bg-white transition-all"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setVideoTarget('new');
                                    setIsVideoRecorderOpen(true);
                                  }}
                                  className="inline-flex items-center gap-1.5 bg-[#EDE9FE] hover:bg-[#E0DCFE] text-[#5C4DF5] text-xs font-semibold px-3 py-2 rounded-xl transition-all cursor-pointer shrink-0 active:scale-95"
                                  title="Créer ou filmer directement la vidéo de votre leçon"
                                >
                                  <Video className="w-3.5 h-3.5" />
                                  <span>Créer / Filmer</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <textarea
                              rows={3}
                              value={newLessonTextContent}
                              onChange={(e) => setNewLessonTextContent(e.target.value)}
                              placeholder="Contenu textuel de la leçon..."
                              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#5C4DF5]/20 resize-y bg-white"
                            />
                          )}
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => handleAddLesson(mod.id)}
                              disabled={isCreatingLesson}
                              className="inline-flex items-center justify-center gap-1.5 bg-[#5C4DF5] hover:bg-[#4B3CE0] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-60"
                            >
                              {isCreatingLesson ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  <span>Ajout en cours...</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Ajouter</span>
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={resetNewLessonForm}
                              className="text-xs text-gray-500 hover:text-gray-800 font-medium px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="px-4 py-2">
                          <button type="button" onClick={() => { resetNewLessonForm(); setAddingLessonModuleId(mod.id); }}
                            className="inline-flex items-center gap-1 text-[11px] text-[#5C4DF5] hover:text-[#4B3CE0] font-semibold cursor-pointer">
                            <Plus className="w-3 h-3" />
                            Ajouter une leçon
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add module */}
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                value={newModuleTitle}
                onChange={(e) => setNewModuleTitle(e.target.value)}
                placeholder="Titre du nouveau module"
                className="flex-1 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#5C4DF5]/20 focus:border-[#5C4DF5] transition-all"
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddModule(); }}
              />
              <button type="button" onClick={handleAddModule} disabled={isAddingModule || !newModuleTitle.trim()}
                className="inline-flex items-center gap-1 bg-[#5C4DF5] hover:bg-[#4B3CE0] disabled:opacity-60 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer shrink-0">
                {isAddingModule ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                Module
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================== */}
      {/* TAB: PUBLICATION */}
      {/* ============================================== */}
      {activeTab === 'publication' && (
        <div className="space-y-4">

          {/* Statut actuel */}
          <div className="bg-white rounded-2xl border border-[#F0F2F6] p-5 sm:p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-gray-900">Statut et publication</h2>

            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500">Statut actuel :</span>
              <CourseStatusBadge status={course.status} size="md" />
            </div>

            {pubMessage && (
              <div className={`text-xs px-3 py-2 rounded-lg font-medium ${
                pubMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
              }`}>
                {pubMessage.text}
              </div>
            )}

            {/* Vérifier conditions */}
            <button type="button" onClick={handleCheckPublication} disabled={isCheckingPublication}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer">
              {isCheckingPublication ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Vérifier les conditions de publication
            </button>

            {/* Checklist */}
            {validation && (
              <div className="border border-gray-100 rounded-xl p-4">
                <PublicationChecklist validation={validation} />

                {validation.canPublish && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-[11px] text-emerald-600 font-medium mb-2">
                      ✓ Toutes les conditions sont remplies.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Publication actions */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              {course.status === 'draft' && (
                <button type="button" onClick={handlePublish} disabled={isPublishing}
                  className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all cursor-pointer">
                  {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                  Publier la formation
                </button>
              )}

              {course.status === 'published' && (
                <button type="button" onClick={handleUnpublish} disabled={isUnpublishing}
                  className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all cursor-pointer">
                  {isUnpublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <EyeOff className="w-4 h-4" />}
                  Dépublier
                </button>
              )}
            </div>
          </div>

          {/* Zone danger : Suppression */}
          <div className="bg-white rounded-2xl border border-red-100 p-5 sm:p-6 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-red-600">Zone de danger</h3>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Si cette formation possède des acheteurs ou des élèves inscrits, elle sera archivée (non supprimée) pour préserver leur accès.
              Sinon, elle sera définitivement supprimée.
            </p>

            {deleteFeedback && (
              <div className={`p-4 rounded-xl text-xs font-medium space-y-2 ${
                deleteFeedback.action === 'archived'
                  ? 'bg-amber-50 border border-amber-200 text-amber-900'
                  : 'bg-emerald-50 border border-emerald-200 text-emerald-900'
              }`}>
                <div className="flex items-center gap-2 font-bold">
                  {deleteFeedback.action === 'archived' ? (
                    <>
                      <Archive className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Statut : Formation archivée</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Statut : Formation supprimée</span>
                    </>
                  )}
                </div>
                <p className="leading-relaxed">{deleteFeedback.message}</p>
                {deleteFeedback.action === 'archived' && (
                  <Link
                    href="/formateur"
                    className="inline-flex items-center gap-1.5 text-[#5C4DF5] hover:underline font-semibold mt-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Retourner à mes formations</span>
                  </Link>
                )}
              </div>
            )}

            {course.status === 'archived' && !deleteFeedback && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-800 flex items-center gap-2">
                <Archive className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Cette formation est actuellement archivée. Les élèves déjà inscrits continuent d&apos;y accéder.</span>
              </div>
            )}

            {course.status !== 'archived' && (
              !showDeleteConfirm ? (
                <button type="button" onClick={() => setShowDeleteConfirm(true)}
                  className="inline-flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5" />
                  Supprimer cette formation
                </button>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
                  <p className="text-xs text-red-700 font-medium">
                    Êtes-vous sûr de vouloir supprimer ou archiver cette formation ? Cette action est irréversible.
                  </p>
                  <div className="flex gap-2">
                    <button type="button" onClick={handleDelete} disabled={isDeleting}
                      className="inline-flex items-center gap-1 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-[11px] font-semibold px-4 py-2 rounded-lg cursor-pointer">
                      {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                      Confirmer
                    </button>
                    <button type="button" onClick={() => setShowDeleteConfirm(false)}
                      className="text-[11px] text-gray-600 hover:text-gray-800 font-medium cursor-pointer">
                      Annuler
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Modal studio d'enregistrement et création vidéo */}
      <VideoRecorderModal
        isOpen={isVideoRecorderOpen}
        onClose={() => setIsVideoRecorderOpen(false)}
        onVideoReady={(url, duration) => {
          if (videoTarget === 'edit') {
            setEditLessonVideoUrl(url);
            if (duration && !editLessonDuration) setEditLessonDuration(duration);
          } else {
            setNewLessonVideoUrl(url);
            if (duration) setNewLessonDuration(duration);
          }
          setIsVideoRecorderOpen(false);
        }}
      />
    </div>
  );
}
