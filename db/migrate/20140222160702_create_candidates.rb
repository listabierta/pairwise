class CreateCandidates < ActiveRecord::Migration
  def self.up
    create_table :candidates do |table|
      table.string :original_file_name, :default => ""
      table.integer :rotation
      table.string :nombre, :default => ""
      table.string :apellidos, :default => ""
      table.string :estudios, :default => ""
      table.string :profesion, :default => ""
      table.string :idiomas, :default => ""
      table.string :partido_politico, :default => ""
      table.string :url_mifirma, :default => ""
      table.text :contribucion_social
      table.text :motivaciones
      table.timestamps
    end

  end

  def self.down
    drop_table :candidates
  end
end
