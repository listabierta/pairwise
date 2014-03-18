class AddAdditionalinfoToCandidates < ActiveRecord::Migration
  def self.up
    add_column "candidates", "additionalinfo", :string, :default => ""
  end

  def self.down
  end
end
