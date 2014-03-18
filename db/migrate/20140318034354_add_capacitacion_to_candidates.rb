class AddCapacitacionToCandidates < ActiveRecord::Migration
  def self.up
    add_column "candidates", "capacitacion", :string, :default => ""
  end

  def self.down
  end
end
