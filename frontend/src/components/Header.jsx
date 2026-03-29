import React from 'react';
import useSWR from 'swr';
import { fetcher } from '../services/api';
import { useLocation } from 'wouter';

const Header = ({ activeView, selectedProjectId, onBackToProjects }) => {
  const [_, navigate] = useLocation();
  const { data: projectData, error } = useSWR(
    selectedProjectId ? `/api/projects/${selectedProjectId}` : null,
    fetcher
  );

  const handleGoHome = () => {
    navigate('/');
    onBackToProjects();
  };

  if (error) {
    return (
      <header className="header">
        <div className="logo">
          <div className="logo-icon">AI</div>
          <span>Annotation Studio</span>
        </div>
        <div style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>
          Error loading project
        </div>
      </header>
    );
  }

  return (
    <header className="header">
      <div className="logo">
        <div className="logo-icon">AI</div>
        <span>Annotation Studio</span>
      </div>
      {projectData && projectData.project && (
        <div className="project-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button 
              onClick={handleGoHome}
              className="btn-back"
              title="Back to projects"
            >
              ←
            </button>
            <span className="project-name">📁 {projectData.project.name}</span>
            <span className={`project-type-badge type-${projectData.project.type}`}>
              {projectData.project.type === 'object_detection' && '🔲 Detection'}
              {projectData.project.type === 'instance_segmentation' && '🔷 Segmentation'}
              {projectData.project.type === 'contrastive_learning' && '⚖️ Contrastive'}
            </span>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
