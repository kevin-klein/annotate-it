export default function ProjectInfo({ project, onBack }) {
  if (!project) return null;

  const getTypeLabel = (annotationType) => {
    const labels = {
      object_detection: 'Object Detection',
      instance_segmentation: 'Instance Segmentation',
      contrastive_learning: 'Contrastive Learning'
    };
    return labels[annotationType] || annotationType;
  };

  const getTypeColor = (annotationType) => {
    const colors = {
      object_detection: '#00d4aa',
      instance_segmentation: '#ff6b6b',
      contrastive_learning: '#4ecdc4'
    };
    return colors[annotationType] || '#0a84ff';
  };

  return (
    <div className="project-info-container">
      <div className="project-header">
        <button className="btn-back" onClick={onBack}>
          ← Back to Projects
        </button>
        <div className="project-title">
          <h2>{project.name}</h2>
          <span 
            className="project-type-badge"
            style={{ backgroundColor: getTypeColor(project.annotation_type) }}
          >
            {getTypeLabel(project.annotation_type)}
          </span>
        </div>
      </div>

      {project.description && (
        <p className="project-description">{project.description}</p>
      )}

      <div className="project-stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>Progress</h3>
            <p>{project.progress_percentage?.toFixed(1) || 0}%</p>
          </div>
        </div>
        {project.total_images && (
          <div className="stat-card">
            <div className="stat-icon">🖼️</div>
            <div className="stat-info">
              <h3>Total Images</h3>
              <p>{project.total_images}</p>
            </div>
          </div>
        )}
        {project.annotated_images && (
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>Annotated</h3>
              <p>{project.annotated_images}</p>
            </div>
          </div>
        )}
        {project.total_annotations && (
          <div className="stat-card">
            <div className="stat-icon">🏷️</div>
            <div className="stat-info">
              <h3>Annotations</h3>
              <p>{project.total_annotations}</p>
            </div>
          </div>
        )}
      </div>

      {project.dataset_name && (
        <div className="project-meta">
          <p><strong>Dataset:</strong> {project.dataset_name}</p>
        </div>
      )}

      <div className="project-meta">
        <p><strong>Created:</strong> {new Date(project.created_at).toLocaleDateString()}</p>
        {project.updated_at && (
          <p><strong>Last Updated:</strong> {new Date(project.updated_at).toLocaleDateString()}</p>
        )}
      </div>
    </div>
  );
}
