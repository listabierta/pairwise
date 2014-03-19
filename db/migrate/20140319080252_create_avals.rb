class CreateAvals < ActiveRecord::Migration
  def self.up
    create_table :avals do |table|
      table.integer :foreign_id
      table.string :msisdn, :default => ""
      table.integer :repeticiones
      table.timestamps
    end

  end

  def self.down
    drop_table :avals
  end
end
