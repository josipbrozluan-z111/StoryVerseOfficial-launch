

import * as React from 'react';
import { HashRouter, Routes, Route, Navigate, useParams, useNavigate, useMatch } from 'react-router-dom';
import { useProject } from './hooks/useProjectFile';
import { ProjectContext } from './contexts/ProjectContext';
import WelcomeScreen from './components/WelcomeScreen';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import CreateNovelPage from './pages/CreateNovelPage';
import ChapterEditorPage from './pages/ChapterEditorPage';
import NovelDetailPage from './pages/NovelDetailPage';
import ReadNovelPage from './pages/ReadNovelPage';
import DemosPage from './pages/DemosPage';
import StoryIdeaEditorPage from './pages/StoryIdeaEditorPage';
import SketchesPage from './pages/SketchesPage';
import SketchEditorPage from './pages/SketchEditorPage';
import { THEME_CONFIG } from './constants';
import { LoadingIcon, Bars3Icon, DocumentPlusIcon } from './components/Icons';
import { Theme, Language } from './types';
import { LanguageContext } from './contexts/LanguageContext';
import { translations } from './utils/translations';
import { useTranslations } from './hooks/useTranslations';

import { auth } from './firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

const NovelEditRedirect = () => {
    const { novelId } = useParams<{ novelId: string }>();
    const { projectData } = React.useContext(ProjectContext);

    if (!projectData || !novelId) {
        return <Navigate to="/" replace />; 
    }

    const novel = projectData.novels.find(n => n.id === novelId);
    
    if (!novel) {
        // Novel was not found, safely redirect to home.
        return <Navigate to="/" replace />;
    }

    if (novel.chapters.length === 0) {
        // If novel has no chapters, redirect to novel detail page.
        return <Navigate to={`/novel/${novelId}`} replace />;
    }

    const firstChapterId = novel.chapters[0].id;
    return <Navigate to={`/novel/${novelId}/edit/${firstChapterId}`} replace />;
};

const AppContent = () => {
    const project = useProject();
    const t = useTranslations();
    
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);
    const navigate = useNavigate();
    const initialLoadHandled = React.useRef(false);

    // This effect handles redirecting to the home page on initial load or after import.
    React.useEffect(() => {
        if (project.status === 'ready' && !initialLoadHandled.current) {
            navigate('/', { replace: true });
            initialLoadHandled.current = true;
        }
    }, [project.status, navigate]);

    const theme = React.useMemo(() => {
        const projectTheme = project.projectData?.settings?.theme || 'book';
        // Fallback to 'book' theme if the saved theme from a project file is no longer valid.
        return (projectTheme in THEME_CONFIG) ? projectTheme as Theme : 'book';
    }, [project.projectData]);

    const language = React.useMemo(() => {
        const projectLang = project.projectData?.settings?.language || 'en';
        return (projectLang in translations) ? projectLang as Language : 'en';
    }, [project.projectData]);

    const currentTranslations = React.useMemo(() => {
        return translations[language];
    }, [language]);

    const themeClasses = React.useMemo(() => {
        return THEME_CONFIG[theme];
    }, [theme]);

    const contextValue = React.useMemo(() => ({
        ...project,
        theme,
        themeClasses,
    }), [project, theme, themeClasses]);

    const onEditPage = useMatch('/novel/:novelId/edit/:chapterId');
    const onReadPage = useMatch('/novel/:novelId/read/:chapterId?');
    const onIdeaEditPage = useMatch('/idea/:ideaId/edit');
    const onSketchEditPage = useMatch('/novel/:novelId/sketch/:sketchId/edit');
    const isSidebarPermanentlyHidden = !!onEditPage || !!onReadPage || !!onIdeaEditPage || !!onSketchEditPage;

    const handleSignInWithGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            // After successful sign in, you can handle loading cloud projects here
            console.log("Successfully signed in with Google!");
        } catch (error: any) {
            console.error("Error signing in with Google:", error);
            alert(`Failed to sign in with Google: ${error.message || "Unknown error"}`);
        }
    };

    const renderContent = () => {
        switch (project.status) {
            case 'loading':
                return (
                    <div className={`flex items-center justify-center h-screen ${themeClasses.bg} ${themeClasses.text}`}>
                        <LoadingIcon className="w-12 h-12 animate-spin" />
                    </div>
                );
            case 'welcome':
                return (
                    <WelcomeScreen 
                        onCreateLocalProject={project.createLocalProject}
                        onOpenLocalProject={project.openLocalProject}
                        onSignInWithGoogle={handleSignInWithGoogle}
                    />
                );
            case 'ready':
                if (!project.projectData) return null;
                return (
                    <div className={`flex h-screen ${themeClasses.bg} ${themeClasses.text}`}>
                        {/* Desktop Sidebar */}
                        {!isSidebarPermanentlyHidden && (
                            <div className="hidden md:block flex-shrink-0">
                                <Sidebar />
                            </div>
                        )}

                        {/* Mobile Sidebar & Overlay */}
                        {!isSidebarPermanentlyHidden && (
                            <>
                                <div 
                                    className={`fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity ${isMobileSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                                    onClick={() => setIsMobileSidebarOpen(false)}
                                    aria-hidden="true"
                                />
                                <div className={`fixed inset-y-0 left-0 z-40 transition-transform duration-300 ease-in-out md:hidden ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                                    <Sidebar onLinkClick={() => setIsMobileSidebarOpen(false)} />
                                </div>
                            </>
                        )}
                        
                        <main className="flex-1 overflow-y-auto">
                            {/* Mobile Header with Hamburger */}
                            {!isSidebarPermanentlyHidden && (
                                <header className={`sticky top-0 z-10 flex items-center justify-between p-4 md:hidden ${themeClasses.bgSecondary} border-b ${themeClasses.border}`}>
                                    <button onClick={() => setIsMobileSidebarOpen(true)} className={themeClasses.accentText}>
                                        <span className="sr-only">Open Menu</span>
                                        <Bars3Icon className="h-6 w-6" />
                                    </button>
                                    <span className={`font-bold ${themeClasses.accentText}`}>StoryVerse</span>
                                    <div className="w-6" /> {/* Spacer to center title */}
                                </header>
                            )}

                            <Routes>
                                <Route path="/" element={<HomePage />} />
                                <Route path="/create-novel" element={<CreateNovelPage />} />
                                <Route path="/demos" element={<DemosPage />} />
                                <Route path="/idea/:ideaId/edit" element={<StoryIdeaEditorPage />} />
                                <Route path="/sketches" element={<SketchesPage />} />
                                <Route path="/novel/:novelId/sketch/:sketchId/edit" element={<SketchEditorPage />} />
                                <Route path="/novel/:novelId" element={<NovelDetailPage />} />
                                <Route path="/novel/:novelId/read/:chapterId?" element={<ReadNovelPage />} />
                                <Route path="/novel/:novelId/edit" element={<NovelEditRedirect />} />
                                <Route path="/novel/:novelId/edit/:chapterId" element={<ChapterEditorPage />} />
                            </Routes>
                        </main>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <ProjectContext.Provider value={contextValue}>
            <LanguageContext.Provider value={currentTranslations}>
                <div className="font-sans">
                    {renderContent()}
                </div>
            </LanguageContext.Provider>
        </ProjectContext.Provider>
    );
};


function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}

export default App;