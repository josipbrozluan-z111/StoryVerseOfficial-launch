import * as React from 'react';
import { ProjectData, Theme, ThemeConfig, SaveStatus } from '../types';

interface ProjectContextType {
  projectData: ProjectData | null;
  setProjectData: React.Dispatch<React.SetStateAction<ProjectData | null>>;
  downloadProject: () => Promise<void>;
  closeProject: () => void;
  theme: Theme;
  themeClasses: ThemeConfig;
  projectName: string;
  saveStatus: SaveStatus;
  storageMode: 'local' | null;
}

export const ProjectContext = React.createContext<ProjectContextType>({
  projectData: null,
  setProjectData: () => {},
  downloadProject: async () => {},
  closeProject: () => {},
  theme: 'dark',
  themeClasses: {
    bg: '',
    bgSecondary: '',
    bgTertiary: '',
    text: '',
    textSecondary: '',
    accent: '',
    accentText: '',
    accentBorder: '',
    border: '',
    input: '',
    logoColor: '',
  },
  projectName: '',
  saveStatus: 'idle',
  storageMode: null,
});
