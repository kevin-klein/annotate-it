import React, { useCallback, useEffect } from 'react';
import { SWRConfig } from 'swr';
import { Route, Switch, Redirect, useParams } from 'wouter';
import { authService } from './services/auth';
import Navbar from './components/Navbar';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Canvas from './components/Canvas';
import ProjectSelection from './components/ProjectSelection';
import ProjectAnnotate from './components/ProjectAnnotate';
import LoginForm from './components/LoginForm';
import { fetcher } from './services/api';

const App = () => {
  const handleBackToProjects = useCallback(() => {
    window.location.href = '/projects';
  }, []);

  return (
    <SWRConfig value={{ fetcher }}>
      <div className="app">
        <Navbar />
        <Switch>
          {/* Home route - Redirect to projects if authenticated */}
          <Route path="/">
            <Redirect to={authService.isAuthenticated() ? '/projects' : '/login'} />
          </Route>

          {/* Projects route */}
          <Route path="/projects">
            <div className="full-screen">
              <ProjectSelection />
            </div>
          </Route>

          {/* Login route */}
          <Route path="/login">
            <LoginForm onLoginSuccess={() => window.location.href = '/projects'} />
          </Route>

          {/* Project Images route */}
          <Route path="/project/:id/images">
            <ProjectImages onBackToProjects={handleBackToProjects} />
          </Route>

          {/* Project Annotate route */}
          <Route path="/project/:id/annotate">
            <ProjectAnnotate />
          </Route>

          {/* 404 - Redirect to home */}
          <Route>
            <Redirect to="/" />
          </Route>
        </Switch>
      </div>
    </SWRConfig>
  );
};

// Project Images view component
const ProjectImages = ({ onBackToProjects }) => {
  const { id: projectId } = useParams();
  const [selectedImage, setSelectedImage] = React.useState(null);
  const [activeAnnotationType, setActiveAnnotationType] = React.useState('object_detection');
  const [uploading, setUploading] = React.useState(false);

  const handleImageSelect = useCallback((image) => {
    setSelectedImage(image);
  }, []);

  const handleUpload = useCallback(async (file) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('projectId', projectId);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        // Success - images will be refreshed by Sidebar's mutate
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  }, [projectId]);

  return (
    <>
      <Header
        activeView="images"
        selectedProjectId={projectId}
        onBackToProjects={onBackToProjects}
      />
      <div className="main-content">
        <Sidebar
          activeView="images"
          selectedProjectId={projectId}
          selectedImage={selectedImage}
          onSelectImage={handleImageSelect}
        />
        {selectedImage ? (
          <Canvas
            selectedImage={selectedImage}
            selectedProjectId={projectId}
            activeAnnotationType={activeAnnotationType}
            onTypeChange={setActiveAnnotationType}
            projectLabels={[]}
          />
        ) : (
          <div className="main-content-empty">
            <div className="empty-state">
              <div className="empty-state-icon">📷</div>
              <div className="empty-state-title">Select an image to view details</div>
              <div className="empty-state-desc">Choose an image from the sidebar</div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default App;
