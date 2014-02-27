class AddAttachmentCandidatos < ActiveRecord::Migration
  def self.up
    change_table :candidates do |t|
      t.has_attached_file :image
    end
  end

  def self.down
    drop_attached_file :candidates, :image
  end
end
