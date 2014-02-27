class AddForeignIdToCandidates < ActiveRecord::Migration
  def self.up
    add_column :candidates, :foreign_id, :integer
  end

  def self.down
    remove_column :candidates, :foreign_id
  end
end
