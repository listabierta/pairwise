class AdjustColumnsCandidates < ActiveRecord::Migration
  def self.up
    change_column(:candidates, :contribucion_social, :string, limit: 400)
    change_column(:candidates, :motivaciones, :string, limit: 400)
    change_column(:candidates, :capacitacion, :string, limit: 400)
    change_column(:candidates, :additionalinfo, :string, limit: 1000)
  end

  def self.down
  end
end
