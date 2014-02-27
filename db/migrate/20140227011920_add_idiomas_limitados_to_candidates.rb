class AddIdiomasLimitadosToCandidates < ActiveRecord::Migration
  def self.up
    add_column :candidates, :idiomas_limitados, :string
  end

  def self.down
    remove_column :candidates, :idiomas_limitados
  end
end
