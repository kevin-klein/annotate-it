module Api
  class BackupsController < ApplicationController
    skip_before_action :verify_authenticity_token
    
    def index
      backups_dir = Rails.root.join('backups')
      return render json: { backups: [] } unless Dir.exist?(backups_dir)
      
      backups = Dir.glob(backups_dir.join('*.db'))
        .map { |path| {
          name: File.basename(path),
          path: path,
          size: File.size(path),
          created_at: File.mtime(path)
        }}
        .sort_by { |b| b[:created_at] }
        .reverse
      
      render json: { backups: backups }
    end
    
    def create
      backup_name = BackupService.create_backup
      
      if backup_name
        BackupService.cleanup_old_backups(10)
        render json: {
          success: true,
          name: backup_name,
          message: 'Backup created successfully'
        }
      else
        render json: { error: 'Failed to create backup' }, status: :internal_server_error
      end
    end
  end
end
