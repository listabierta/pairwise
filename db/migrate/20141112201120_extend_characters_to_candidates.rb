class ExtendCharactersToCandidates < ActiveRecord::Migration
  def self.up
    change_column :candidates, :motivaciones, :text, :limit => nil
    change_column :candidates, :capacitacion, :text, :limit => nil
  end

  def self.down
    change_column :candidates, :motivaciones, :string, :limit => 400
    change_column :candidates, :capacitacion, :string, :limit => 400
  end
end
