import React, { useCallback } from 'react';
import { SWRConfig } from 'swr';
import { Route, Switch, Redirect } from 'wouter';
import { authService } from './services/auth';
import Navbar from './components/Navbar';
import ProjectSelection from './components/ProjectSelection';
import ProjectView from './components/ProjectView';
import LoginForm from './components/LoginForm';
import { ToastProvider } from './context/ToastContext';
import { authenticatedApi as api } from './services/auth';

const App = () => {
  const handleBackToProjects = useCallback(() => {
    window.location.href = '/projects';
  }, []);

  return (
    <SWRConfig value={{ fetcher: api.fetcher }}>
      <ToastProvider>
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

          {/* Project view (images + annotate) */}
          <Route path="/project/:id/images">
            <ProjectView onBackToProjects={handleBackToProjects} />
          </Route>

          <Route path="/project/:id/annotate">
            <ProjectView onBackToProjects={handleBackToProjects} />
          </Route>

          {/* 404 - Redirect to home */}
          <Route>
            <Redirect to="/" />
          </Route>
        </Switch>
        </div>
      </ToastProvider>
    </SWRConfig>
  );
};

export default App;
