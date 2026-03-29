class BackupService
  def self.create_backup
    timestamp = Time.now.strftime('%Y-%m-%d_%H-%M-%S-%L')
    backup_name = "annotations_#{timestamp}.db"
    backup_path = Rails.root.join('backups', backup_name)

    # Ensure backups directory exists
    FileUtils.mkdir_p(Rails.root.join('backups')) unless Dir.exist?(Rails.root.join('backups'))

    # Copy database file
    db_path = Rails.application.config.database_configuration['default']['database']
    source_path = Rails.root.join('db', "#{db_path}.sqlite3")

    if File.exist?(source_path)
      File.binwrite(backup_path, File.read(source_path))
      Rails.logger.info("Backup created: #{backup_name}")
      backup_name
    else
      Rails.logger.warn("Database file not found at #{source_path}")
      nil
    end
  end

  def self.cleanup_old_backups(limit = 10)
    backups_dir = Rails.root.join('backups')
    return unless Dir.exist?(backups_dir)

    backups = Dir.glob(backups_dir.join('*.db')).sort

    if backups.size > limit
      backups[0..-limit-1].each do |backup|
        File.delete(backup)
        Rails.logger.info("Deleted old backup: #{File.basename(backup)}")
      end
    end
  end
end
