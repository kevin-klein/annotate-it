namespace :data do
  desc 'Migrate data from SQLite to Rails'
  task migrate: :environment do
    require 'sqlite3'
    
    old_db_path = Rails.root.join('..', 'data', 'annotations.db')
    
    unless File.exist?(old_db_path)
      puts "Old database not found at #{old_db_path}"
      exit 1
    end
    
    old_db = SQLite3::Database.new(old_db_path)
    
    # Migrate projects
    puts "Migrating projects..."
    old_db.execute("SELECT id, name, description, type, dataset_id, created_at, updated_at FROM projects").each do |row|
      Project.find_or_create_by(id: row[0]) do |p|
        p.name = row[1]
        p.description = row[2]
        p.type = row[3]
        p.dataset_id = row[4]
        p.created_at = row[5]
        p.updated_at = row[6]
      end
    end
    
    # Migrate images
    puts "Migrating images..."
    old_db.execute("SELECT id, filename, original_name, file_path, width, height, project_id, metadata, checksum, export_path, created_at, updated_at FROM images").each do |row|
      Image.find_or_create_by(id: row[0]) do |i|
        i.filename = row[1]
        i.original_name = row[2]
        i.file_path = row[3]
        i.width = row[4]
        i.height = row[5]
        i.project_id = row[6]
        i.metadata = row[7] || '{}'
        i.checksum = row[8]
        i.export_path = row[9]
        i.created_at = row[10]
        i.updated_at = row[11]
      end
    end
    
    # Migrate annotations
    puts "Migrating annotations..."
    old_db.execute("SELECT id, image_id, dataset_id, type, data, label, metadata, confidence, created_at, updated_at FROM annotations").each do |row|
      image = Image.find_by(id: row[1])
      next unless image
      
      Annotation.find_or_create_by(id: row[0]) do |a|
        a.image = image
        a.type = row[3]
        a.data = row[4]
        a.label = row[5]
        a.metadata = row[6] || '{}'
        a.confidence = row[7]
        a.created_at = row[8]
        a.updated_at = row[9]
      end
    end
    
    puts "Migration complete!"
    
    old_db.close
  end
end
